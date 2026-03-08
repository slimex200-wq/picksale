import { useEffect } from "react";

interface PageMetaProps {
  title: string;
  description: string;
}

/**
 * Sets document.title and <meta name="description"> dynamically.
 * Cleans up description meta on unmount.
 */
export default function PageMeta({ title, description }: PageMetaProps) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;

    return () => {
      meta?.remove();
    };
  }, [description]);

  return null;
}
