// import { WebSocketServer, WebSocketClient } from "https://deno.land/x/websocket@v0.1.4/mod.ts";

// const runServer = () => {

//     // start the websocket server
//     const wss = new WebSocketServer(8080);
//     console.log("Started websocket server");

//     // WebSocketServer message handler
//     wss.on("connection", (ws: WebSocketClient) => {
//         console.log("New client connection");

//         ws.on("message", (message: string) => {
//             console.log(`User Message: ${message}`);

//         });
//     });
// }

// const runClient = () => {

//     const endpoint = "ws://127.0.0.1:8080";
//     const socket = new WebSocketStream(endpoint);

//     socket.connection.then( async (connection) => {
//         console.log("ws connected!");

//         const writer = connection.writable.getWriter();

//         const reader = connection.readable.getReader();

//         const encoder = new TextEncoder();
//         const decoder = new TextDecoder();
//         while (true) {
//             const { done, value } = await reader.read();
//             if (done) break;
//             const token = decoder.decode(value);
//             const data = encoder.encode(token);
//             Deno.stdout.write(data);
//         }
            


    
//     });
// }