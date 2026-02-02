"use server";

import {
  getFollowingFeed,
  getTrendingMerchants,
  getTrendingProducts,
} from "@/data/trends";
import { getDiscoverableUsers } from "@/data/users";

export async function fetchFollowingFeed(limit = 20) {
  return getFollowingFeed(limit);
}

export async function fetchTrendingProducts(limit = 20, daysAgo = 7) {
  return getTrendingProducts(limit, daysAgo);
}

export async function fetchTrendingMerchants(limit = 20) {
  return getTrendingMerchants(limit);
}

export async function fetchDiscoverableUsers() {
  return getDiscoverableUsers();
}
