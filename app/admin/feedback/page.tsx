import { FeedbackList } from "@/components/admin/feedback-list";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllFeedback } from "@/data/feedback";
import { Suspense } from "react";

async function AdminFeedbackContent() {
	const allFeedback = await getAllFeedback();

	const stats = {
		total: allFeedback.length,
		pending: allFeedback.filter((f) => f.status === "pending").length,
		reviewing: allFeedback.filter((f) => f.status === "reviewing").length,
		completed: allFeedback.filter((f) => f.status === "completed").length,
		rejected: allFeedback.filter((f) => f.status === "rejected").length,
	};

	return (
		<div className="container mx-auto max-w-7xl py-7 space-y-7">
			<div>
				<h1 className="text-2xl font-bold tracking-tight">Feedback Management</h1>
				<p className="text-muted-foreground mt-0.5 text-sm">
					Review and manage user feedback
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-5">
        {Object.entries(stats).map(([key, value]) => (
          <Card key={key}>
            <CardHeader className="pb-2">
              <CardDescription className="capitalize">{key}</CardDescription>
              <CardTitle className="text-3xl">{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Feedback</CardTitle>
					<CardDescription>
						Manage and review feedback from users
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Suspense fallback={
						<div className="text-center text-muted-foreground py-8">Loading feedback...</div>
					}>
						<FeedbackList feedback={allFeedback} />
					</Suspense>
				</CardContent>
			</Card>
		</div>
	);
}

function AdminFeedbackSkeleton() {
	return (
		<div className="container mx-auto max-w-7xl py-7 space-y-7">
			<div>
				<Skeleton className="h-8 w-48" />
				<Skeleton className="mt-2 h-4 w-64" />
			</div>

			<div className="grid gap-4 md:grid-cols-5">
				{[1, 2, 3, 4, 5].map((i) => (
					<Card key={i}>
						<CardHeader className="pb-2">
							<Skeleton className="h-4 w-16" />
							<Skeleton className="h-8 w-8" />
						</CardHeader>
					</Card>
				))}
			</div>

			<Card>
				<CardHeader>
					<Skeleton className="h-6 w-32" />
					<Skeleton className="h-4 w-48" />
				</CardHeader>
				<CardContent>
					<div className="text-center text-muted-foreground py-8">Loading feedback...</div>
				</CardContent>
			</Card>
		</div>
	);
}

export default async function AdminFeedbackPage() {
	return (
		<Suspense fallback={<AdminFeedbackSkeleton />}>
			<AdminFeedbackContent />
		</Suspense>
	);
}