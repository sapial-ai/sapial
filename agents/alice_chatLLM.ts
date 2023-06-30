import { IConfig } from "../interfaces.ts";
import { Sapial } from "../sapial.ts";


const config: IConfig = {
    name: "Alice",
    primaryModel: "gpt-4",
    secondaryModel: "gpt-4",
    memory: true,
}

const alice = await Sapial.init(config);

const prompt = "Hello, I am Sapial. What is your name?"
const response = await alice.chatLLM(prompt);
console.log(response);
// here is an example of provided response
// Hello Sapial, I'm OpenAI. Nice to meet you!




