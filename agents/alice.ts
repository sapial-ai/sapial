import { IConfig } from "../interfaces.ts";
import { Sapial } from "../sapial.ts";

// we need to create a single fastAPI server
// we may spawn multiple models

const config: IConfig = {
    name: "Alice",
    primaryModel: "gpt-4",
    secondaryModel: "gpt-4",
    memory: true,
}

const alice = Sapial.init(config);

console.log("Alice is online");

// const prompt = "Hello, I am Alice. What is your name?"
// const response = await alice.call(prompt);
// console.log(response);



