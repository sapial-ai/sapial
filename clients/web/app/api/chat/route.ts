// IMPORTANT! Set the runtime to edge
export const runtime = "edge";

const endpoint = "http://127.0.0.1:4242";

export async function POST(req: Request) {
  // Extract the `prompt` from the body of the request
  const { messages } = await req.json();

  const response = await fetch(endpoint, {
    method: "POST",
    body: messages[messages.length - 1].content,
    headers: {
      "Content-Type": "text/plain", // Set the appropriate content type
    },
  });

  return response;
}
