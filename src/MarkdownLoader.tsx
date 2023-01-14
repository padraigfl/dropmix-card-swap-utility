import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

const generateSlug = (string?: string) => {
  if (!string) {
    return undefined;
  }
  let str = string.replace(/^\s+|\s+$/g, "");
  str = str.toLowerCase();
  str = str
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return str
}

const getHeading = (Tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') => (props: any) => {
  if (typeof props.children[0] !== 'string') {
    return null
  }
  return (
    <Tag id={generateSlug(props.children[0])}>
      {props.children}
    </Tag>
  )
}

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
    <ReactMarkdown
      // remarkPlugins={[remarkGfm]}
      components={{
        h1: getHeading('h1'),
        h2: getHeading('h2'),
        h3: getHeading('h3'),
        h4: getHeading('h4'),
        h5: getHeading('h5'),
        h6: getHeading('h6'),
      }}
      children={markdown}
    />
  )
}