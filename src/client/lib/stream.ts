export async function readJsonEventStream(
  response: Response,
  onEvent: (payload: unknown) => void,
) {
  if (!response.ok) {
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;
    throw new Error(payload?.error?.message ?? "Unable to start streaming.");
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Streaming is not supported in this browser.");
  }

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split("\n\n");
    buffer = events.pop() ?? "";

    for (const event of events) {
      const dataLine = event
        .split("\n")
        .find((line) => line.startsWith("data: "));

      if (!dataLine) {
        continue;
      }

      onEvent(JSON.parse(dataLine.slice(6)));
    }
  }
}
