import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { verifySession } from "@/data/user-session";
import { Button } from "../ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { FeedbackHistory } from "./feedback-history";

export async function FeedbackHistoryWrapper() {
  const sessionData = await verifySession();

  if (!sessionData.success || !sessionData.session) {
    return (
      <Empty className="min-h-[400px]">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageSquare className="size-6" />
          </EmptyMedia>
          <EmptyTitle>Sign in to submit feedback</EmptyTitle>
          <EmptyDescription className="font-mono tracking-tighter">
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
    );
  }

  const userId = sessionData.session.user?.id;
  return <FeedbackHistory userId={userId} />;
}
