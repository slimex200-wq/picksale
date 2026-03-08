import { useEffect } from "react";

interface CanonicalLinkProps {
  href: string;
}

/**
 * Injects a <link rel="canonical"> tag into <head>.
 * Cleans up on unmount or when href changes.
 */
export default function CanonicalLink({ href }: CanonicalLinkProps) {
  useEffect(() => {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = href;

    return () => {
      link?.remove();
    };
  }, [href]);

  return null;
}
