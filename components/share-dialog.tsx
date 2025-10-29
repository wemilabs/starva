"use client";

import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ShareDialogProps {
  url: string;
  buttonTitle?: string;
  title?: string;
  description?: string;
  className?: string;
}

export function ShareDialog({
  url,
  buttonTitle,
  title = "Share this page",
  description = "Copy the link to share this merchant with others",
  className,
}: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy URL:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={cn("gap-2", className)}>
          <Share2 className="size-4" />
          {buttonTitle}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input
            value={url}
            readOnly
            className="flex-1"
            onClick={e => e.currentTarget.select()}
          />
          <Button
            size="sm"
            className="shrink-0"
            onClick={handleCopy}
            variant={copied ? "secondary" : "default"}
          >
            {copied ? (
              <>
                <Check className="size-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="size-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
