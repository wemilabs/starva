import "server-only";
import { UTApi } from "uploadthing/server";

export const utapi = new UTApi();

export function extractFileKeyFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/f\/([^/?]+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error extracting file key from URL:", error);
    return null;
  }
}
