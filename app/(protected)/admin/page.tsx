import { ChevronRight, Mail, MessageSquare, Users } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminDashboardPage() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Link href="/admin/user-management">
        <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors">
                  <Users className="size-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">User Management</CardTitle>
                  <CardDescription className="text-sm">
                    Manage user accounts and permissions
                  </CardDescription>
                </div>
              </div>
              <div className="text-muted-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <ChevronRight className="size-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              View, edit, and manage all user accounts in the system
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/admin/feedback-management">
        <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20 group-hover:bg-green-200 dark:group-hover:bg-green-900/30 transition-colors">
                  <MessageSquare className="size-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Feedback Management</CardTitle>
                  <CardDescription className="text-sm">
                    Review and respond to user feedback
                  </CardDescription>
                </div>
              </div>
              <div className="text-muted-foreground group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                <ChevronRight className="size-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Monitor feedback status and manage user submissions
            </p>
          </CardContent>
        </Card>
      </Link>

      <Link href="/admin/email-management">
        <Card className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/30 transition-colors">
                  <Mail className="size-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-lg">Email Management</CardTitle>
                  <CardDescription className="text-sm">
                    View and manage received emails
                  </CardDescription>
                </div>
              </div>
              <div className="text-muted-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                <ChevronRight className="size-5" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground">
              Monitor incoming emails and professional inquiries
            </p>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
