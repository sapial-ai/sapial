/**
 * Agent CLI 
 * 
 * Connects to the agent via a websocket
 * Listens for user input and sends it to the agent
 * Listens for messages from the agent and prints them to the console
 * 
 */
export function run() {

    // establish a websocket connection to the local agent
    const socket = new WebSocket("ws://localhost:8080/connect_wss?username=user");

    console.log("waiting for connection...");
    console.log(socket);


    socket.addEventListener("open", async () => {
        // listen for new input from the user and send it to the agent
        console.log("Connected to agent");

        while (true) {
            // const encoder = new TextEncoder();
            const decoder = new TextDecoder();
            const buf = new Uint8Array(4096);
            const n = <number>await Deno.stdin.read(buf);
            const userInput = decoder.decode(buf.subarray(0, n));
            socket.send(userInput);
            console.log("Sent: " + userInput);
        }
      });

    // listen for new messages from the agent
    socket.onmessage = (message) => {
        const data = JSON.parse(message.data);

        switch (data.type) {
            case "message":
                console.log(data.message);
                break;
        }
    }

    
}

run();