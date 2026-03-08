import { useEffect } from "react";

interface JsonLdProps {
  data: Record<string, unknown>;
}

/**
 * Injects a JSON-LD <script> tag into <head>.
 * Automatically cleans up on unmount or when data changes.
 */
export default function JsonLd({ data }: JsonLdProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    script.setAttribute("data-jsonld", "true");
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [JSON.stringify(data)]);

  return null;
}
