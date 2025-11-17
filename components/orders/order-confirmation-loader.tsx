import { Spinner } from "../ui/spinner";

export function OrderConfirmationLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <Spinner className="size-12 mb-4" />
        <p className="text-muted-foreground font-mono tracking-tighter">
          Loading...
        </p>
      </div>
    </div>
  );
}
