"use client";

import { Check, Copy, Share2, Smartphone, MessageCircle } from "lucide-react";
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
  shareText?: string;
}

export function ShareDialog({
  url,
  buttonTitle,
  title = "Share this page",
  description = "Share this merchant with others",
  className,
  shareText,
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

  const handleWhatsAppShare = () => {
    const text = shareText || url;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    
    try {
      await navigator.share({
        title: title,
        text: shareText || `Check out this business: ${url}`,
        url: url,
      });
    } catch (error) {
      console.error("Failed to share:", error);
    }
  };

  const supportsNativeShare = typeof navigator !== 'undefined' && navigator.share;

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
        
        <div className="space-y-4">
          {/* Share Options */}
          <div className="grid grid-cols-1 gap-3">
            {/* WhatsApp Share */}
            <Button
              onClick={handleWhatsAppShare}
              variant="outline"
              className="flex items-center gap-3 justify-start h-auto p-4"
            >
              <MessageCircle className="size-5 text-green-600" />
              <div className="text-left">
                <div className="font-medium">Share on WhatsApp</div>
                <div className="text-sm text-muted-foreground">
                  Send directly to WhatsApp contacts
                </div>
              </div>
            </Button>

            {/* Native Share (if supported) */}
            {supportsNativeShare && (
              <Button
                onClick={handleNativeShare}
                variant="outline"
                className="flex items-center gap-3 justify-start h-auto p-4"
              >
                <Smartphone className="size-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Share via device</div>
                  <div className="text-sm text-muted-foreground">
                    Use your device's share options
                  </div>
                </div>
              </Button>
            )}

            {/* Copy Link */}
            <Button
              onClick={handleCopy}
              variant="outline"
              className="flex items-center gap-3 justify-start h-auto p-4"
            >
              {copied ? (
                <Check className="size-5 text-green-500" />
              ) : (
                <Copy className="size-5" />
              )}
              <div className="text-left">
                <div className="font-medium">
                  {copied ? "Link copied!" : "Copy link"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {copied ? "Ready to paste anywhere" : "Copy URL to clipboard"}
                </div>
              </div>
            </Button>
          </div>

          {/* URL Display */}
          <div className="border-t pt-4">
            <div className="text-sm text-muted-foreground mb-2">Link preview:</div>
            <Input
              value={url}
              readOnly
              className="font-mono text-sm"
              onClick={e => e.currentTarget.select()}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
