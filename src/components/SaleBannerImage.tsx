import { useState } from "react";
import PlatformLogo from "@/components/PlatformLogo";
import type { Platform } from "@/data/salesUtils";

interface Props {
  imageUrl?: string;
  platform: Platform;
  alt: string;
  className?: string;
  /** Height class for the banner container, e.g. "h-32" */
  heightClass?: string;
}

/** Returns true if the URL looks like a video file */
function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|avi)(\?|$)/i.test(url);
}

/**
 * Displays a sale banner image with cover crop (top-aligned).
 * Falls back to a centered platform logo on error, missing URL, or video URLs.
 */
export default function SaleBannerImage({ imageUrl, platform, alt, className = "", heightClass = "h-28" }: Props) {
  const [broken, setBroken] = useState(false);

  const hasValidImage = imageUrl && imageUrl.trim() !== "" && !isVideoUrl(imageUrl) && !broken;

  if (hasValidImage) {
    return (
      <div className={`w-full ${heightClass} overflow-hidden bg-muted ${className}`}>
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover object-top"
          loading="lazy"
          draggable={false}
          onError={() => setBroken(true)}
        />
      </div>
    );
  }

  // Fallback: centered platform logo
  return (
    <div className={`w-full ${heightClass} overflow-hidden bg-accent/40 flex items-center justify-center ${className}`}>
      <div className="bg-white/90 rounded-xl p-3 shadow-sm flex items-center justify-center" style={{ minWidth: 80, minHeight: 48 }}>
        <PlatformLogo platform={platform} className="object-contain" style={{ maxHeight: 48, maxWidth: 80 }} />
      </div>
    </div>
  );
}
