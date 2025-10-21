import { FeedbackForm } from "@/components/forms/feedback-form";
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
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { getFeedbackByUser } from "@/data/feedback";
import { verifySession } from "@/data/user-session";
import { formatDateShort } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import Link from "next/link";

const feedbackTypeLabels = {
  bug: "🐛 Bug",
  feature: "✨ Feature",
  improvement: "📈 Improvement",
  general: "💬 General",
};

const statusVariants = {
  pending: "secondary" as const,
  reviewing: "default" as const,
  completed: "default" as const,
  rejected: "destructive" as const,
};

export default async function FeedbackPage() {
  const sessionData = await verifySession();

  if (!sessionData.success || !sessionData.session) {
    return (
      <div className="container mx-auto max-w-7xl py-7 space-y-7">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Share your thoughts and help us improve
          </p>
        </div>
        <Empty className="min-h-[400px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MessageSquare className="size-6" />
            </EmptyMedia>
            <EmptyTitle>Sign in to submit feedback</EmptyTitle>
            <EmptyDescription>
              You need to be signed in to submit feedback or view your previous
              submissions
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild size="sm" className="w-full">
              <Link href="/sign-in">
                <span>Sign In</span>
              </Link>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  const userId = sessionData.session.user?.id;
  const previousFeedback = await getFeedbackByUser(userId);

  return (
    <div className="container mx-auto max-w-7xl py-7 space-y-7">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Feedback</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Share your thoughts and help us improve
        </p>
      </div>

      <div className="grid gap-7 lg:grid-cols-2">
        <div className="min-w-0">
          <FeedbackForm />
        </div>

        <div className="space-y-4 min-w-0">
          <Card>
            <CardHeader>
              <CardTitle>Your Feedback History</CardTitle>
              <CardDescription>
                Track the status of your previous submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previousFeedback.length === 0 ? (
                <Empty className="min-h-[200px]">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <MessageSquare className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle className="text-base">
                      No feedback yet
                    </EmptyTitle>
                    <EmptyDescription className="text-sm">
                      Your submitted feedback will appear here
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className="space-y-4">
                  {previousFeedback.map((item, index) => (
                    <div key={item.id}>
                      {index > 0 && <Separator className="mb-4" />}
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1 flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {item.subject}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {feedbackTypeLabels[item.type]}
                              </Badge>
                              <Badge
                                variant={statusVariants[item.status]}
                                className="text-xs"
                              >
                                {item.status}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {formatDateShort(item.createdAt)}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.message}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
