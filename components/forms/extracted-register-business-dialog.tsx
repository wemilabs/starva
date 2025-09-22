"use client";

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
import { RegisterBusinessForm } from "./register-business-form";

export function ExtractedRegisterBusinessDialog() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Claim business</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register Business</DialogTitle>
          <DialogDescription>
            Register a new business to get started.
          </DialogDescription>
        </DialogHeader>
        <RegisterBusinessForm onSuccess={() => setDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
