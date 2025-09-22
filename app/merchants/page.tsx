import Link from "next/link";
import { Suspense } from "react";
import { getAllBusinesses } from "@/data/businesses";

export default async function MerchantsPage() {
  const merchants = await getAllBusinesses();
  return (
    <div>
      <h1>All Merchants</h1>
      <div className="flex flex-col gap-4 mt-4">
        <Suspense fallback={<div>Loading...</div>}>
          {merchants?.map((merchant) => (
            <div key={merchant.id}>
              <Link href={`/merchants/${merchant.slug}`}>{merchant.name}</Link>
            </div>
          ))}
        </Suspense>
      </div>
    </div>
  );
}
