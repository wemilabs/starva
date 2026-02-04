"use client";

import { useQuery } from "@tanstack/react-query";
import { Heart, UserPlus, Users } from "lucide-react";
import Link from "next/link";

import { UserFollowButton } from "@/components/follows/user-follow-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInitials } from "@/lib/utils";
import { fetchDiscoverableUsers } from "@/server/trends";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import { Skeleton } from "../ui/skeleton";

const DiscoverUsersContent = () => {
  const { data: users = [], isLoading } = useQuery<
    Awaited<ReturnType<typeof fetchDiscoverableUsers>>
  >({
    queryKey: ["discoverable-users"],
    queryFn: () => fetchDiscoverableUsers(),
    // staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Skeleton className="h-50" />
        <Skeleton className="h-50" />
        <Skeleton className="h-50" />
        <Skeleton className="h-50" />
        <Skeleton className="h-50" />
        <Skeleton className="h-50" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Empty className="min-h-[400px] border border-dashed border-muted-foreground/50">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UserPlus className="size-6" />
          </EmptyMedia>
          <EmptyTitle>No users to discover</EmptyTitle>
          <EmptyDescription className="font-mono tracking-tighter">
            You're following everyone! Check back later for new users.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {users.map(
        ({ id: userId, followersCount, likesCount, name, image: imgSrc }) => (
          <Card
            key={userId}
            className="group hover:shadow-md transition-shadow"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <Link href={`/users/${userId}`}>
                  <Avatar className="size-14 ring-2 ring-border group-hover:ring-primary/50 transition-all">
                    <AvatarImage src={imgSrc ?? ""} alt={name} />
                    <AvatarFallback className="bg-linear-to-br from-primary to-red-500 text-white font-semibold">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/users/${userId}`} className="hover:opacity-80">
                    <CardTitle className="text-base truncate">{name}</CardTitle>
                  </Link>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="size-3" />
                      <span>{followersCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="size-3" />
                      <span>{likesCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <UserFollowButton
                userId={userId}
                initialIsFollowing={false}
                initialFollowersCount={followersCount}
                revalidateTargetPath="/trends-and-socials"
                className="w-full"
              />
            </CardContent>
          </Card>
        ),
      )}
    </div>
  );
};

export default DiscoverUsersContent;
