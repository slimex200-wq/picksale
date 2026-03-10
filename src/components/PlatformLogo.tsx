import { useState } from "react";
import { platformLogos } from "@/data/platformLogos";
import type { Platform } from "@/data/salesUtils";

const EMPTY_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E";

interface Props {
  platform: Platform;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 플랫폼 로고를 안전하게 렌더링합니다.
 * 이미지 로드 실패 시 플랫폼 이름 첫 글자를 표시합니다.
 */
export default function PlatformLogo({ platform, className = "w-full h-full object-contain", style }: Props) {
  const [broken, setBroken] = useState(false);
  const src = platformLogos[platform];

  if (broken || !src) {
    return (
      <span
        className="flex items-center justify-center text-muted-foreground font-bold select-none"
        style={{ fontSize: 11, ...style }}
      >
        {platform.charAt(0)}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      className={`bg-transparent ${className}`}
      style={style}
      loading="lazy"
      draggable={false}
      onError={() => setBroken(true)}
    />
  );
}
