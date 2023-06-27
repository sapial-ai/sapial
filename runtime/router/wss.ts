// import * as Oak from "https://deno.land/x/oak@v12.5.0/mod.ts";
// import { EventEmitter } from "https://deno.land/x/event@2.0.1/mod.ts";

// type Events = {
//     prompt: [string];
//   };

// export class Router extends EventEmitter<Events> {
//     clients = new Map<string, WebSocketStream>();
//     app = new Oak.Application();
//     router = new Oak.Router();
//     port = 8080;

//     constructor() {
//         super();
//     }

//     public async init() {

//         this.router.get('prompt', (ctx) => {


//         })


//         this.router.get('connect_wss', (ctx) => {
//             console.log("New client connection");
//             const socket = ctx.upgrade();
//             const username = ctx.request.url.searchParams.get("username");
        
//             if(username && this.clients.has(username)) {
//                 socket.close(1008, `Username ${username} is already taken`);
//             }
        
//             if (username) {
//                 this.clients.set(username, socket);
//                 console.log(`New client connected: ${username}`);
//             } else {
//                 socket.close(1008, "Username is required");
//             }
        
//             socket.onclose = () => {
//                 console.log(`Client disconnected: ${username}`);
//                 this.clients.delete(username!);
//             }
        
//             socket.onmessage = (message) => {
//                 const data = JSON.parse(message.data);
        
//                 switch (data.type) {
//                     case "message": 
//                         console.log(data.message);
//                         this.emit("prompt", data.message).then((response) => {
//                             socket.send(JSON.stringify({ type: "message", message: response }));
//                         });
//                         break;
//                 }
//             }
//         });

//         this.app.use(this.router.routes());
//         this.app.use(this.router.allowedMethods());
//         console.log("Listening at http://localhost:" + this.port);
//         await this.app.listen({port: this.port});  
//     }

//     // todo
//     // public async close() {
//     //     this.clients.forEach((client) => {
//     //         client.close();
//     //     });
//     // }

// }



  