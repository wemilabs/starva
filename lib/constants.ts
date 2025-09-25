export const STATUS_VALUES = ["in_stock", "out_of_stock", "archived"] as const;
export type StatusValue = (typeof STATUS_VALUES)[number];
