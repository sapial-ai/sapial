import { serve } from "https://deno.land/std@0.184.0/http/server.ts";

function handler(request: Request): Response {
    let timer: number | undefined = undefined;
    const body = new ReadableStream({

        start(controller) {
            timer = setInterval(() => {
              const message = `It is ${new Date().toISOString()}\n`;
              controller.enqueue(new TextEncoder().encode(message));
            }, 1000);
          },

        cancel() {
            if (timer !== undefined) {
                clearInterval(timer);
            }
        }
    });

    return new Response(body, {
        headers: {
            "content-type": "text/plain",
            "x-content-type-options": "nosniff",
        },
    });
}

console.log("Listening at http://localhost:8080");
serve(handler, { port: 8080 });