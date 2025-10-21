import { FeedbackList } from "@/components/admin/feedback-list";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAllFeedback } from "@/data/feedback";

export default async function AdminFeedbackPage() {
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
					<FeedbackList feedback={allFeedback} />
				</CardContent>
			</Card>
		</div>
	);
}