import { IConfig } from "../interfaces.ts";
import { Sapial } from "../sapial.ts";

// we need to create a single fastAPI server
// we may spawn multiple models

const config: IConfig = {
    name: "Alice",
    primaryModel: "gpt-3.5-turbo-16k",
    secondaryModel: "gpt-4",
}

const alice = Sapial.init(config);

console.log("Alice is online");

// const prompt = "Hello, I am Alice. What is your name?"
// const response = await alice.call(prompt);
// console.log(response);



