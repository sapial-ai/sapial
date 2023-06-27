import { WebSocketClient, StandardWebSocketClient } from "https://deno.land/x/websocket@v0.1.4/mod.ts";

const endpoint = "ws://127.0.0.1:8080";
const ws: WebSocketClient = new StandardWebSocketClient(endpoint);

// connection handler 
ws.on("open", async () => {
    console.log("ws connected!");

    // listen for user input and send messages to the wss
    while (true) {
        // const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const buf = new Uint8Array(4096);
        const n = <number>await Deno.stdin.read(buf);
        const userInput = decoder.decode(buf.subarray(0, n));
        ws.send(userInput);
    }
});

// message handler
ws.on("message", (message) => {
    console.log(message.data);
}); 

// error handler
ws.on("error", (e: Error) => {
    console.log("ws error:");
    console.log(e);
});

// close handler
ws.on("close", () => {
    console.log("ws closed!");
});




