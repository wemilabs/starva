import { Suspense } from "react";
import { FeedbackForm } from "../forms/feedback-form";
import { FeedbackHistorySkeleton } from "./feedback-history-skeleton";
import { FeedbackHistoryWrapper } from "./feedback-history-wrapper";

export async function FeedbackContent() {
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
					<Suspense fallback={<FeedbackHistorySkeleton />}>
						<FeedbackHistoryWrapper />
					</Suspense>
				</div>
			</div>
		</div>
	);
}