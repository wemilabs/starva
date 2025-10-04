"use client";

import { useRef, useState, useTransition } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface EditableBusinessDescriptionProps {
  businessId: string;
  businessSlug: string;
  initialDescription?: string;
  updateAction: (
    businessId: string,
    businessSlug: string,
    description: string
  ) => Promise<void>;
}

export function EditableBusinessDescription({
  businessId,
  businessSlug,
  initialDescription = "",
  updateAction,
}: EditableBusinessDescriptionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(initialDescription);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleCancel = () => {
    setDescription(initialDescription);
    setIsEditing(false);
  };

  const handleSave = () => {
    const trimmedDescription = description.trim();
    if (trimmedDescription === initialDescription) {
      setIsEditing(false);
      return;
    }

    startTransition(async () => {
      try {
        await updateAction(businessId, businessSlug, trimmedDescription);
        setIsEditing(false);
        toast.success("Description updated", {
          description:
            "Your business description has been updated successfully.",
        });
      } catch (error) {
        console.error("Failed to update description:", error);
        setDescription(initialDescription);
        toast.error("Failed to update description", {
          description: "Your business description could not be updated.",
        });
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      handleCancel();
    }
    // Ctrl/Cmd + Enter to save
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Textarea
          ref={textareaRef}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          placeholder="Add a description for your business..."
          maxLength={500}
          className="min-h-24 bg-white/10 backdrop-blur rounded-lg ring-1 ring-white/15 text-white placeholder:text-white/50 resize-none"
        />
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSave}
            disabled={isPending}
            size="sm"
            className="bg-white text-black hover:bg-white/90"
          >
            <Check className="size-4 mr-1" />
            Save
          </Button>
          <Button
            onClick={handleCancel}
            disabled={isPending}
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/10"
          >
            <X className="size-4 mr-1" />
            Cancel
          </Button>
          <span className="text-xs text-white/50 ml-auto">
            {description.length}/500
          </span>
        </div>
      </div>
    );
  }

  if (!description) {
    return (
      <Button
        onClick={handleEdit}
        variant="ghost"
        size="sm"
        className="text-white/70 hover:text-white hover:bg-white/10 -ml-2"
      >
        <Pencil className="size-3 mr-1" />
        Add description
      </Button>
    );
  }

  return (
    <div className="group relative">
      <p className="text-white/80 text-sm leading-relaxed pr-8">
        {description}
      </p>
      <Button
        onClick={handleEdit}
        size="icon"
        variant="ghost"
        className="absolute top-0 right-0 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-white/10"
      >
        <Pencil className="size-3" />
      </Button>
    </div>
  );
}
