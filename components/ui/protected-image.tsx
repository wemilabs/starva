"use client";

import Image, { ImageProps } from "next/image";

export function ProtectedImage(props: ImageProps) {
  return <Image {...props} onContextMenu={(e) => e.preventDefault()} />;
}
