import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownProps {
  content: string;
}

export default function Markdown({ content }: MarkdownProps) {
  return (
    <div className="markdown-content">
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .markdown-content table {
            border-collapse: collapse;
            width: 100%;
          }
          .markdown-content th,
          .markdown-content td {
            border: 1px solid #ccc;
            padding: 6px 13px;
          }
          .markdown-content th {
            background-color: #f3f4f6;
            font-weight: 600;
          }
          .markdown-content h1 {
            font-size: 0.875rem;
            font-weight: 700;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
          }
          .markdown-content h2 {
            font-size: 1rem;
            font-weight: 600;
            margin-top: 1.25rem;
            margin-bottom: 0.75rem;
          }
          .markdown-content h3 {
            font-size: 1rem;
            font-weight: 600;
            margin-top: 1rem;
            margin-bottom: 0.5rem;
          }
          .markdown-content p {
            margin-bottom: 1rem;
          }
          .markdown-content ul,
          .markdown-content ol {
            margin-bottom: 1rem;
            padding-left: 1.5rem;
          }
          .markdown-content li {
            margin-bottom: 0.25rem;
          }
          .markdown-content code {
            background-color: #f3f4f6;
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
          }
          .markdown-content pre {
            background-color: #f3f4f6;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin-bottom: 1rem;
          }
          .markdown-content pre code {
            background-color: transparent;
            padding: 0;
          }
          .markdown-content blockquote {
            border-left: 4px solid #e5e7eb;
            padding-left: 1rem;
            margin: 1rem 0;
            color: #6b7280;
          }
          .markdown-content a {
            color: #eb8525;
            text-decoration: underline;
          }
          .markdown-content a:hover {
            color: #eb8525;
          }
        `,
        }}
      />
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
