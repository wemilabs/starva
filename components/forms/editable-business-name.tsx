"use client";

import { useRef, useState, useTransition } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface EditableBusinessNameProps {
  businessId: string;
  businessSlug: string;
  initialName: string;
  updateAction: (
    businessId: string,
    businessSlug: string,
    name: string
  ) => Promise<void>;
}

export function EditableBusinessName({
  businessId,
  businessSlug,
  initialName,
  updateAction,
}: EditableBusinessNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleCancel = () => {
    setName(initialName);
    setIsEditing(false);
  };

  const handleSave = () => {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName === initialName) {
      handleCancel();
      return;
    }

    startTransition(async () => {
      try {
        await updateAction(businessId, businessSlug, trimmedName);
        setIsEditing(false);
        toast.success("Business name updated", {
          description: "Your business name has been updated successfully.",
        });
      } catch (error) {
        console.error("Failed to update business name:", error);
        setName(initialName);
        toast.error("Failed to update business name", {
          description: "Your business name could not be updated.",
        });
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isPending}
          // className="text-3xl md:text-5xl font-semibold tracking-tight bg-white/10 backdrop-blur rounded-lg px-3 py-1 ring-1 ring-white/15 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50"
          maxLength={100}
        />
        <Button
          onClick={handleSave}
          disabled={isPending || !name.trim()}
          size="icon"
          variant="ghost"
          className="h-10 w-10 text-white hover:bg-white/10"
        >
          <Check className="size-4" />
        </Button>
        <Button
          onClick={handleCancel}
          disabled={isPending}
          size="icon"
          variant="ghost"
          className="h-10 w-10 text-white hover:bg-white/10"
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 group">
      <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
        {name}
      </h1>
      <Button
        onClick={handleEdit}
        size="icon"
        variant="ghost"
        className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-white/10"
      >
        <Pencil className="size-4" />
      </Button>
    </div>
  );
}
