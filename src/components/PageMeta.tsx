import { useEffect } from "react";

interface PageMetaProps {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
}

const DEFAULT_OG_IMAGE = "/og-default.png";
const SITE_URL = "https://picksale.lovable.app";

/**
 * Sets document.title, meta description, and Open Graph meta tags.
 * Cleans up on unmount.
 */
export default function PageMeta({ title, description, ogImage, ogType = "website", ogUrl }: PageMetaProps) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    const tags: HTMLMetaElement[] = [];

    const setMeta = (attr: string, key: string, content: string) => {
      let meta = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, key);
        document.head.appendChild(meta);
        tags.push(meta);
      }
      meta.content = content;
    };

    const fullUrl = ogUrl || window.location.href;
    const fullImage = (ogImage || DEFAULT_OG_IMAGE).startsWith("http")
      ? ogImage || `${SITE_URL}${DEFAULT_OG_IMAGE}`
      : `${SITE_URL}${ogImage || DEFAULT_OG_IMAGE}`;

    setMeta("name", "description", description);
    setMeta("property", "og:title", title);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:url", fullUrl);
    setMeta("property", "og:image", fullImage);
    setMeta("property", "og:site_name", "PickSale");
    setMeta("property", "og:locale", "ko_KR");
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title);
    setMeta("name", "twitter:description", description);
    setMeta("name", "twitter:image", fullImage);

    return () => {
      tags.forEach((tag) => tag.remove());
    };
  }, [title, description, ogImage, ogType, ogUrl]);

  return null;
}
