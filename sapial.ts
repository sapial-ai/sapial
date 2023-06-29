import { IConfig } from "./interfaces.ts";
import * as proc from "https://deno.land/x/proc@0.20.28/mod3.ts";
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { guidelines, role } from "./runtime/prompts/prompts.ts";
// import { estimateTokens } from "./runtime/utils/utils.ts";

export class Sapial {
    public readonly name: string;
    public readonly primaryModel: string;
    public readonly secondaryModel: string;
    private memory: boolean;
    private summarizeChat = false;
    private chatSummary = ``;
    private bufferChat = false;
    private chatBuffer: string[] = [];
    private readonly contextSize = 16_384;
    private readonly conversatationSummarySize = 4_096;
    private readonly messageBufferSize = 4_096;
    private store: Deno.Kv;

    constructor(config: IConfig, store: Deno.Kv ) {
        this.name = config.name;
        this.primaryModel = config.primaryModel;
        this.secondaryModel = config.secondaryModel;
        this.memory = config.memory;
        this.store = store; 
                
        if (config.memory) {
            this.summarizeChat = true;
            this.bufferChat = true;
        }

        // setup the proxy server
        const handler = async (request: Request) => {
            const humanMessage = await request.text();
            console.log(`Human message: ${humanMessage}`);
            const humanMessageWithContext = this.injectContext(humanMessage);
            console.log(`Human message with context: ${humanMessageWithContext}`);
            const streamingResponse = await this.streamLLM(humanMessageWithContext);
            const { readable, writable } = new TransformStream<Uint8Array>;
            const [responseReadable, localReadable] = readable.tee()
            streamingResponse.body!.pipeTo(writable);

            if (this.memory) {
                this.streamToString(localReadable).then( async (AIMessage) => {
                    console.log(`AI response: ${AIMessage}`)
                    await this.addMessagePairToBuffer(humanMessage, AIMessage);
                    this.summarizeChatHistory()
                });
            }
            return new Response(responseReadable);
        };

        serve(handler, { port: 4242 });
    }

    /**
     * 
     * Summarization Feature
     */
    summarizeChatHistory() {
        const chatBufferSize = this.chatBuffer.length;
        const summarizerPrompt = ` //send over recent summary+messages to api call
            ${this.getChatSummary()}
            ${this.getRecentMessages()}
            `;

        console.log(`Summarizer prompt: ${summarizerPrompt}`);
        
        this.chatLLM(summarizerPrompt).then(async (summary) => { //.then specifies a return
            console.log(`Chat Summary: ${summary}`)
            this.chatSummary = summary;
            await this.store.set(['summary'], summary); //sets variable in memory
            this.chatBuffer.splice(0, chatBufferSize);
        });
    }

    async chatLLM(prompt:string) { //moved prompting from JS to Python back-end 
        const endpoint = `http://localhost:8000/chat/${prompt}`
        const response = await fetch(endpoint);   //returns a string
        const responseText = await response.text();
        const responseString = responseText.toString();
        return responseString;
    }

    // if summarizing, return the current summary
    getChatSummary(): string {
        const summary = `
            Below is the current summary of the chat history with your human:
            --summary--
            ${this.chatSummary? this.chatSummary : `No history to summarize yet.`}
            --summary--
            `;
        return this.summarizeChat ? summary : ``;
    }

    // if buffering, return the most recent (unsummarized) messages 
    getRecentMessages(): string {
        const recentMessages = `
            Here are the most recent messages exchanged with your human:
            --messages--
            ${this.chatBuffer.join('\n')}
            --messages--
            `;

        return this.bufferChat ? recentMessages : ``;
    }

    /**
     * 
     * Streaming & init features
     */

    // create a new root sapial agent from a new config object
    public static async init(config: IConfig) {

        // start the uvicron API server for python services
        proc.run("bash", "run.sh");    
        console.log("Started API service");

        const store = await Deno.openKv();

        // create the sapial agent
        const sapial = new Sapial(config, store);
        return sapial;
    }

    async streamToString(stream: ReadableStream) {
        const reader = stream.getReader();
        const decoder = new TextDecoder("utf-8");
        let result = "";
      
        while (true) {
          const { done, value } = await reader.read();
      
          if (done) {
            return result;
          }
      
          result += decoder.decode(value);
        }
    }

    // adds a new message exchange to the chat buffer and logs
    async addMessagePairToBuffer(humanMessage: string, AIMessage: string) {

        const messagePair = `
            --human-message--
            ${humanMessage}
            --human-message--

            --ai-message--
            ${AIMessage}
            --ai-message--
            `;

        console.log(`Added the follow message to the chat buffer: ${messagePair}`);

        this.chatBuffer.push(messagePair.toString());
        const timestamp = Date.now();
        await this.store.set(['logs', timestamp], messagePair);
        return messagePair
    }

    // add arbitrary context to a prompt (i.e. a conversation summary) before sending to a model
    injectContext(prompt: string) {
        const message = `
            ${role}
            ${this.getChatSummary()}
            ${this.getRecentMessages()}
            ${guidelines}
            ${prompt}
        `
        return message;
    }

    // call the model API service and stream the response
    async streamLLM(prompt: string) {
        const model = this.primaryModel;
        const endpoint = `http://localhost:8000/stream/${model}/${prompt}`
        const response = await fetch(endpoint);
        return response
    }
}