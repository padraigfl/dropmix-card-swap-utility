import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export const MarkdownLoader = (props: { file: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markdown, setMarkdown] = useState<string>('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    window.fetch(props.file)
      .then(res => res.text())
      .then(res => {
        setMarkdown(res);
      })
      .catch(e => setError(e))
      .finally(() => setLoading(false))
  }, [props.file]);

  if (loading) {
    return <>Loading {props.file}</>;
  }
  if (error) {
    return <>Failed to load {props.file}<br/>Reason {JSON.stringify(error)}</>
  }
  return (
    <ReactMarkdown>
      {markdown}
    </ReactMarkdown>
  )
}