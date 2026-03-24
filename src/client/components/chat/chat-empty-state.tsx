"use client";

const SUGGESTIONS = [
  "Summarize the uploaded files and pull out the action items.",
  "Compare this screenshot with the product requirements and point out the gaps.",
  "Turn the meeting notes into a clean implementation plan with risks and next steps.",
];

export function ChatEmptyState({
  onSuggestionClick,
}: {
  onSuggestionClick: (text: string) => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="w-full max-w-3xl rounded-[32px] border bg-[var(--app-surface-muted)] px-6 py-8 md:px-8 md:py-10 [border-color:var(--app-border)]">
        <p className="text-sm font-medium text-[var(--app-muted)]">gpt-chatbot</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--app-text)] md:text-[2.5rem]">
          How can I help today?
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--app-muted)]">
          Ask a question, upload a document for context, or paste an image directly
          into the composer. Chats are saved automatically and synced across tabs.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onSuggestionClick(suggestion)}
              className="rounded-[24px] border bg-[var(--app-surface)] p-4 text-left transition hover:bg-[var(--app-hover)] [border-color:var(--app-border)] hover:[border-color:var(--app-border-strong)]"
            >
              <p className="text-sm leading-6 text-[var(--app-text)]">{suggestion}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
