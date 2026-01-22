import Markdown from "react-markdown";

export default function MessageBlock({
  content,
  type,
}: {
  content: string;
  type: "AI" | "HUMAN";
}) {
  return (
    <section className="flex flex-col gap-y-2 border rounded-lg border-gray-400 px-4 py-2">
      {type === "HUMAN" ? (
        <p className="text-sm text-gray-600">User</p>
      ) : (
        <p className="text-sm text-gray-600">Agent</p>
      )}
      <article className={`flex flex-col`}>
        <Markdown>{content}</Markdown>
      </article>
    </section>
  );
}
