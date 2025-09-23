export const STATUS_VALUES = ["active", "inactive", "archived"] as const;
export type StatusValue = (typeof STATUS_VALUES)[number];
