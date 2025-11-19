import { User } from "lucide-react";

export function AccountSettings() {
  return (
    <div className="border rounded-lg p-6 space-y-6">
      <div className="flex items-center gap-2">
        <User className="size-4" />
        <h2 className="text-lg font-medium">Account</h2>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground font-mono tracking-tighter">
          Account settings coming soon: profile management, email preferences,
          password change, etc.
        </p>
      </div>
    </div>
  );
}
