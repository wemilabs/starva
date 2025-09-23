"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";

type Props = {
  action: (formData: FormData) => Promise<void>;
  className?: string;
};

export function UpdateBusinessLogoForm({ action, className }: Props) {
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  return (
    <form action={action} className={className}>
      <input
        ref={hiddenInputRef}
        type="hidden"
        name="logoUrl"
        id="logoUrlHidden"
      />

      <UploadButton
        endpoint="businessLogo"
        className="ut-button:bg-primary ut-button:ut-readying:bg-primary/50"
        onClientUploadComplete={(res) => {
          const url =
            (res?.[0] && ((res[0] as any).ufsUrl || (res[0] as any).url)) || "";
          if (hiddenInputRef.current && url) {
            hiddenInputRef.current.value = url;
            hiddenInputRef.current.form?.requestSubmit();
          }
        }}
        onUploadError={(err) => {
          console.error(err);
          toast.error(err?.message || "Upload failed. Please try again.");
        }}
      />
    </form>
  );
}
