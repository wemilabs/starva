import { ourFileRouter } from "@/app/api/uploadthing/core";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { connection } from "next/server";
import { extractRouterConfig } from "uploadthing/server";

export async function UploadThingProvider() {
  await connection();
  return <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />;
}
