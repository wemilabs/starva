"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle,
  Clock,
  Download,
  Mail,
  Paperclip,
  RefreshCw,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { parseAsStringLiteral, useQueryStates } from "nuqs";
import { Activity, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateShort, formatDistanceToNow } from "@/lib/utils";
import {
  deleteReceivedEmail,
  getEmailStats,
  getReceivedEmails,
} from "@/server/admin/emails";

interface Email {
  id: string;
  emailId: string;
  from: string;
  to: string[];
  subject: string | null;
  textBody?: string | null;
  htmlBody?: string | null;
  status: "received" | "processed" | "failed";
  createdAt: Date;
  attachments?: Array<{
    id: string;
    filename: string;
    contentType: string;
    size: number | null;
  }>;
}

const statusOptions = ["all", "received", "processed", "failed"] as const;

export function AdminEmailManagement() {
  const queryClient = useQueryClient();
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [emailToDelete, setEmailToDelete] = useState<string | null>(null);

  const [{ search, status }, setFilters] = useQueryStates(
    {
      search: { defaultValue: "", parse: (v) => v || "" },
      status: parseAsStringLiteral(statusOptions).withDefault("all"),
    },
    {
      shallow: true,
      throttleMs: 300,
    }
  );

  const {
    data: emails = [],
    isLoading: emailsLoading,
    refetch: refetchEmails,
  } = useQuery({
    queryKey: ["admin-emails", search, status],
    queryFn: () =>
      getReceivedEmails({
        search: search || undefined,
        status: status === "all" ? undefined : status,
      }),
  });

  const {
    data: stats = {
      total: 0,
      received: 0,
      processed: 0,
      failed: 0,
    },
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["admin-email-stats"],
    queryFn: () => getEmailStats(),
  });

  const deleteEmailMutation = useMutation({
    mutationFn: deleteReceivedEmail,
    onSuccess: () => {
      toast.success("Email deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-emails"] });
      queryClient.invalidateQueries({ queryKey: ["admin-email-stats"] });
      if (selectedEmail) {
        setSelectedEmail(null);
      }
    },
    onError: (error) => {
      console.error("Failed to delete email:", error);
      toast.error("Failed to delete email");
    },
    onSettled: () => {
      setEmailToDelete(null);
    },
  });

  const handleDeleteEmail = async (emailId: string) => {
    setEmailToDelete(emailId);
  };

  const confirmDelete = () => {
    if (!emailToDelete) return;
    deleteEmailMutation.mutate(emailToDelete);
  };

  const refreshData = () => {
    refetchEmails();
    refetchStats();
  };

  const isLoading = emailsLoading || statsLoading;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received":
        return <Mail className="size-4" />;
      case "processed":
        return <CheckCircle className="size-4 text-green-500" />;
      case "failed":
        return <XCircle className="size-4 text-red-500" />;
      default:
        return <Clock className="size-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "default";
      case "processed":
        return "outline";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-lg">Email Management</h2>
        <Button variant="outline" onClick={refreshData} disabled={isLoading}>
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
            <Mail className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Received</CardTitle>
            <Clock className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.received}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <CheckCircle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.processed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.failed}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-[300px_1fr]">
        {/* Email List */}
        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  value={search}
                  onChange={(e) => setFilters({ search: e.target.value })}
                  className="pl-8 placeholder:text-sm text-sm"
                />
                <Activity mode={search ? "visible" : "hidden"}>
                  <button
                    type="button"
                    onClick={() => setFilters({ search: "" })}
                    className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                </Activity>
              </div>
              <Tabs
                value={status}
                onValueChange={(value) =>
                  setFilters({
                    status: value as
                      | "all"
                      | "received"
                      | "processed"
                      | "failed",
                  })
                }
              >
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="received">New</TabsTrigger>
                  <TabsTrigger value="processed">Done</TabsTrigger>
                  <TabsTrigger value="failed">Failed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {isLoading ? (
                  <div className="flex justify-center p-4">
                    <RefreshCw className="size-4 animate-spin" />
                    <span className="ml-2 text-sm text-muted-foreground font-mono tracking-tighter">
                      Loading emails...
                    </span>
                  </div>
                ) : emails.length === 0 ? (
                  <Empty className="border-none p-0">
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Mail className="size-6" />
                      </EmptyMedia>
                      <EmptyTitle>No emails found</EmptyTitle>
                      <EmptyDescription className="font-mono tracking-tighter text-sm">
                        No emails match your current filters
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  emails.map((email) => (
                    <button
                      type="button"
                      key={email.id}
                      className={`w-full text-left p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                        selectedEmail?.id === email.id ? "bg-accent" : ""
                      }`}
                      onClick={() => setSelectedEmail(email)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(email.status)}
                            <p className="text-sm font-medium truncate">
                              {email.from}
                            </p>
                          </div>
                          <p className="text-sm font-medium truncate">
                            {email.subject || "No Subject"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(email.createdAt))}
                          </p>
                        </div>
                        {email.attachments && email.attachments.length > 0 && (
                          <Paperclip className="size-4 text-muted-foreground ml-2" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Email Detail */}
        <Card>
          <CardHeader>
            {selectedEmail ? (
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl">
                    {selectedEmail.subject || "No Subject"}
                  </CardTitle>
                  <CardDescription>
                    From: {selectedEmail.from} •{" "}
                    {formatDateShort(selectedEmail.createdAt)}
                  </CardDescription>
                  <Badge variant={getStatusColor(selectedEmail.status)}>
                    {selectedEmail.status}
                  </Badge>
                </div>
                <AlertDialog
                  open={emailToDelete !== null}
                  onOpenChange={() =>
                    !deleteEmailMutation.isPending && setEmailToDelete(null)
                  }
                >
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        selectedEmail &&
                        handleDeleteEmail(selectedEmail.emailId)
                      }
                      disabled={deleteEmailMutation.isPending || !selectedEmail}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Email</AlertDialogTitle>
                      <AlertDialogDescription className="font-mono tracking-tighter text-sm">
                        Are you sure you want to delete this email? This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel
                        disabled={deleteEmailMutation.isPending}
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={confirmDelete}
                        disabled={deleteEmailMutation.isPending}
                      >
                        {deleteEmailMutation.isPending
                          ? "Deleting..."
                          : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ) : (
              <div className="text-center text-muted-foreground font-mono text-sm tracking-tighter">
                Select an email to view details
              </div>
            )}
          </CardHeader>
          <CardContent>
            {selectedEmail ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">To:</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedEmail.to.join(", ")}
                  </p>
                </div>

                {selectedEmail.attachments &&
                  selectedEmail.attachments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Attachments:</h4>
                      <div className="space-y-2">
                        {selectedEmail.attachments.map((attachment) => (
                          <div
                            key={attachment.id}
                            className="flex items-center justify-between p-2 border rounded"
                          >
                            <div className="flex items-center gap-2">
                              <Paperclip className="size-4" />
                              <span className="text-sm">
                                {attachment.filename}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({((attachment.size ?? 0) / 1024).toFixed(1)}{" "}
                                KB)
                              </span>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const url = await (
                                    await import("@/server/admin/emails")
                                  ).getEmailAttachmentUrl(attachment.id);
                                  if (url) {
                                    window.open(url, "_blank");
                                  }
                                } catch (error) {
                                  console.error(
                                    "Failed to download attachment:",
                                    error
                                  );
                                }
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  (async () => {
                                    try {
                                      const url = await (
                                        await import("@/server/admin/emails")
                                      ).getEmailAttachmentUrl(attachment.id);
                                      if (url) {
                                        window.open(url, "_blank");
                                      }
                                    } catch (error) {
                                      console.error(
                                        "Failed to download attachment:",
                                        error
                                      );
                                    }
                                  })();
                                }
                              }}
                            >
                              <Download className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                <div>
                  <h4 className="text-sm font-medium mb-2">Message:</h4>
                  {selectedEmail.htmlBody ? (
                    <iframe
                      srcDoc={selectedEmail.htmlBody}
                      className="w-full h-96 border rounded"
                      title="Email content"
                      sandbox="allow-same-origin"
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap text-sm">
                      {selectedEmail.textBody}
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-muted-foreground">
                <Mail className="size-12" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
