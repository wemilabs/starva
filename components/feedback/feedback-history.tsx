import { getFeedbackByUser } from "@/data/feedback";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Empty,  EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import { FEEDBACK_STATUS_VARIANTS, FEEDBACK_TYPE_LABELS } from "@/lib/constants";
import { MessageSquare } from "lucide-react";

export async function FeedbackHistory({ userId }: { userId: string }) {
  const previousFeedback = await getFeedbackByUser(userId);

  return (
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
              <EmptyTitle className="text-base">No feedback yet</EmptyTitle>
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
                          {FEEDBACK_TYPE_LABELS[item.type]}
                        </Badge>
                        <Badge
                          variant={FEEDBACK_STATUS_VARIANTS[item.status]}
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
  );
}