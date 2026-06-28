import ReactMarkdown from "react-markdown";

interface MarkdownContentProps {
  content: string;
}

const MarkdownContent = ({ content }: MarkdownContentProps) => {
  return (
    <div className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:tracking-tighter prose-headings:font-black prose-p:text-white/60 prose-li:text-white/60 prose-strong:text-white">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default MarkdownContent;
