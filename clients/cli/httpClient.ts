const endpoint = "http://127.0.0.1:4242";

console.log(
  "%cWelcome to CLI chat!",
  "color: blue; font-size: 20px; font-weight: bold;"
);

while (true) {
  console.log("\n");

  // listen for user input and send messages to the server
  const buf = new Uint8Array(4096);
  const n = <number>await Deno.stdin.read(buf);
  const readableStream = new ReadableStream({
    start(controller) {
      controller.enqueue(buf.subarray(0, n));
      controller.close();
    },
  });

  // construct the request
  const request = new Request(endpoint, {
    method: "POST",
    body: readableStream,
    headers: {
      "Content-Type": "text/plain",
    },
  });

  // send the request to agent
  const response = await fetch(request);

  // stream the reply to the console
  const reader = response.body!.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    Deno.stdout.write(value);
  }
}
