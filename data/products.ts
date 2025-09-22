import "server-only";
import { eq } from "drizzle-orm";
// import { verifySession } from "@/data/user-session";
import { cache } from "react";

import { db } from "@/db/drizzle";
import { product } from "@/db/schema";

export const getProducts = cache(async () => {
  const products = await db.query.product.findMany({
    where: eq(product.status, "active"),
  });

  return { message: "success", data: /*products*/ null };
});

// export const getProductById = cache(async (productId: string) => {
//   await verifySession();

//   const product = await db.query.product.findFirst({
//     where: eq(product.id, productId),
//   });

//   return { message: "success", data: product };
// });
