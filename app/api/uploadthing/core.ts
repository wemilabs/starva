import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTFiles } from "uploadthing/server";
import { auth } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  // Product media route
  productMedia: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 3, // could be dependent on the current plan
    },
    video: {
      maxFileSize: "64MB",
      maxFileCount: 1, // could be dependent on the current plan
    },
  })
    .middleware(async ({ req, files }) => {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session) throw new UploadThingError("Unauthorized");

      // Get store info from request headers or query params
      const storeSlug =
        req.headers.get("x-store-slug") ||
        req.nextUrl.searchParams.get("storeSlug");

      // Organize files by store in their names
      const fileOverrides = files.map((file) => {
        const folderPrefix = storeSlug ? `${storeSlug}/` : "default-store/";
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const newName = `${folderPrefix}products/${timestamp}_${randomSuffix}_${file.name}`;
        return { ...file, name: newName };
      });

      return {
        userId: session.user.id,
        storeSlug: storeSlug || "default-store",
        [UTFiles]: fileOverrides,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        url: file.ufsUrl,
        uploadedBy: metadata.userId,
        storeSlug: metadata.storeSlug,
      };
    }),

  // Store logo route
  storeLogo: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req, files }) => {
      const session = await auth.api.getSession({ headers: req.headers });
      if (!session) throw new UploadThingError("Unauthorized");

      // Get store info from request headers or query params
      const storeSlug =
        req.headers.get("x-store-slug") ||
        req.nextUrl.searchParams.get("storeSlug");

      // For single file, just override the name directly
      const file = files[0];
      const folderPrefix = storeSlug ? `${storeSlug}/` : "default-store/";
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const newName = `${folderPrefix}branding/${timestamp}_${randomSuffix}_logo_${file.name}`;

      return {
        userId: session.user.id,
        storeSlug: storeSlug || "default-store",
        [UTFiles]: [{ ...file, name: newName }],
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        url: file.ufsUrl,
        uploadedBy: metadata.userId,
        storeSlug: metadata.storeSlug,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
