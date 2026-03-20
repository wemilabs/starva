import { notFound } from "next/navigation";

export default function ErrorTestPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  throw new Error("Intentional test error");
}
