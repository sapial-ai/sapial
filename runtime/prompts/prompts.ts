
// The history of the current conversatoin, up to the context length
export class Memory {
    contextSize: number;
    conversatationSummarySize: number;
    messageBufferSize: number;
    store: Deno.Kv;

    constructor(store: Deno.Kv) {
        this.contextSize = 4096;
        this.conversatationSummarySize = 1024;
        this.messageBufferSize = 2048;
        this.store = store;
    }

    // add to chat log and 
    async addMessage(message: string) {
        // non blocking and atomic
        await this.store.set(['logs'], [message]);
        await this.store.set(['buffer'], [message]);
    }

    // remove the last message from the buffer and add to summary
    async summarize() {
        // ensure summary is less than max
        const summary = this.store.get(['summary'])
            .then()

    }

    // grab the summary and the message buffer and create a new message
    async getHistory() {
        const summary = await this.store.get(['summary']);
        if (typeof(summary) === "string") {
            return summary
        } else {
            return undefined
        }
    }


}

const conversationHistory = " ";


const recentMessages = " ";



