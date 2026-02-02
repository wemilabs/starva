"use client";

import { UserCheck, UserPlus } from "lucide-react";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleUserFollow } from "@/server/follows";

type UserFollowButtonProps = {
  userId: string;
  initialIsFollowing: boolean;
  initialFollowersCount: number;
  revalidateTargetPath: string;
  variant?: "default" | "compact";
  className?: string;
};

type OptimisticState = {
  isFollowing: boolean;
  followersCount: number;
};

export function UserFollowButton({
  userId,
  initialIsFollowing,
  initialFollowersCount,
  revalidateTargetPath,
  variant = "default",
  className,
}: UserFollowButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimisticState, setOptimisticState] = useOptimistic<
    OptimisticState,
    OptimisticState
  >(
    { isFollowing: initialIsFollowing, followersCount: initialFollowersCount },
    (_, newState) => newState,
  );

  const handleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const newIsFollowing = !optimisticState.isFollowing;
    const newFollowersCount = newIsFollowing
      ? optimisticState.followersCount + 1
      : Math.max(0, optimisticState.followersCount - 1);

    startTransition(async () => {
      setOptimisticState({
        isFollowing: newIsFollowing,
        followersCount: newFollowersCount,
      });

      const result = await toggleUserFollow({
        userId,
        revalidateTargetPath,
      });

      if (!result.ok) {
        console.error("Failed to toggle follow:", result.error);
        toast.error("Failed to toggle follow", {
          description:
            typeof result.error === "string"
              ? result.error
              : "Oops! Something went wrong",
        });
      }
    });
  };

  if (variant === "compact") {
    return (
      <Button
        type="button"
        size="icon"
        variant={optimisticState.isFollowing ? "secondary" : "outline"}
        onClick={handleFollow}
        disabled={isPending}
        aria-label={
          optimisticState.isFollowing ? "Unfollow user" : "Follow user"
        }
        className={cn("size-8", className)}
      >
        {optimisticState.isFollowing ? (
          <UserCheck className="size-4" />
        ) : (
          <UserPlus className="size-4" />
        )}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={optimisticState.isFollowing ? "secondary" : "default"}
      onClick={handleFollow}
      disabled={isPending}
      aria-label={optimisticState.isFollowing ? "Unfollow user" : "Follow user"}
      className={cn("gap-2", className)}
    >
      {optimisticState.isFollowing ? (
        <UserCheck className="size-4" />
      ) : (
        <UserPlus className="size-4" />
      )}
      <span className="text-sm">
        {optimisticState.isFollowing ? "Following" : "Follow"}
      </span>
    </Button>
  );
}
