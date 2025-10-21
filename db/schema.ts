import { relations } from "drizzle-orm";
import {
  boolean,
  decimal,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { randomUUID } from "node:crypto";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  lastLoginMethod: text("last_login_method"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id").references(
    () => organization.id,
    { onDelete: "set null" },
  ),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date(),
  ),
});

export const organization = pgTable("organization", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull(),
  metadata: text("metadata"),
});

export const organizationRelations = relations(organization, ({ many }) => ({
  members: many(member),
  invitations: many(invitation),
  products: many(product),
  orders: many(order),
}));

export const role = pgEnum("role", ["member", "admin", "owner"]);

export const member = pgTable("member", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  role: role("role").default("member").notNull(),
  createdAt: timestamp("created_at").notNull(),
});

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));

export const invitation = pgTable("invitation", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: text("role"),
  status: text("status").default("pending").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  inviterId: text("inviter_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const invitationRelations = relations(invitation, ({ one }) => ({
  organization: one(organization, {
    fields: [invitation.organizationId],
    references: [organization.id],
  }),
  inviter: one(user, {
    fields: [invitation.inviterId],
    references: [user.id],
  }),
}));

export const status = pgEnum("status", [
  "in_stock",
  "out_of_stock",
  "archived",
]);

export const orderStatus = pgEnum("order_status", [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "cancelled",
]);

export const product = pgTable(
  "product",
  {
    id: text("id")
      .$defaultFn(() => randomUUID())
      .primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    likesCount: integer("likes_count").default(0),
    status: status("status").default("in_stock").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    calories: integer("calories"),
    imageUrl: text("image_url"),
    brand: text("brand"),
    createdAt: timestamp("created_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [
    index("product_slug_idx").on(t.slug),
    index("product_org_idx").on(t.organizationId),
  ],
);

export const tag = pgTable(
  "tag",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description"),
    status: status("status").default("in_stock").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [
    index("tag_slug_idx").on(t.slug),
    index("tag_org_idx").on(t.organizationId),
  ],
);

export const productTag = pgTable(
  "product_tag",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, {
        onDelete: "cascade",
      }),
    tagId: text("tag_id")
      .notNull()
      .references(() => tag.id, { onDelete: "cascade" }),
  },
  (t) => [
    index("product_tag_product_idx").on(t.productId),
    index("product_tag_tag_idx").on(t.tagId),
    unique("product_tag_unique").on(t.productId, t.tagId),
  ],
);

export const productLike = pgTable(
  "product_like",
  {
    id: text("id")
      .$defaultFn(() => randomUUID())
      .primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [
    index("product_like_product_idx").on(t.productId),
    index("product_like_user_idx").on(t.userId),
    unique("product_like_unique").on(t.productId, t.userId),
  ],
);

export const productLikeRelations = relations(productLike, ({ one }) => ({
  product: one(product, {
    fields: [productLike.productId],
    references: [product.id],
  }),
  user: one(user, {
    fields: [productLike.userId],
    references: [user.id],
  }),
}));

export const productRelations = relations(product, ({ one, many }) => ({
  organization: one(organization, {
    fields: [product.organizationId],
    references: [organization.id],
  }),
  productTags: many(productTag),
  orderItems: many(orderItem),
  productLikes: many(productLike),
}));

export const order = pgTable(
  "order",
  {
    id: text("id")
      .$defaultFn(() => randomUUID())
      .primaryKey(),
    orderNumber: integer("order_number").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    notes: text("notes"),
    status: orderStatus("status").default("pending").notNull(),
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
    updatedAt: timestamp("updated_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [
    index("order_user_idx").on(t.userId),
    index("order_org_idx").on(t.organizationId),
    index("order_status_idx").on(t.status),
    index("order_number_idx").on(t.orderNumber),
    unique("order_number_per_org").on(t.organizationId, t.orderNumber),
  ],
);

export const orderItem = pgTable(
  "order_item",
  {
    id: text("id")
      .$defaultFn(() => randomUUID())
      .primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    priceAtOrder: decimal("price_at_order", {
      precision: 10,
      scale: 2,
    }).notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp("created_at")
      .$defaultFn(() => new Date())
      .notNull(),
  },
  (t) => [
    index("order_item_order_idx").on(t.orderId),
    index("order_item_product_idx").on(t.productId),
  ],
);

export const orderRelations = relations(order, ({ one, many }) => ({
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [order.organizationId],
    references: [organization.id],
  }),
  orderItems: many(orderItem),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, {
    fields: [orderItem.orderId],
    references: [order.id],
  }),
  product: one(product, {
    fields: [orderItem.productId],
    references: [product.id],
  }),
}));

export const tagRelations = relations(tag, ({ many }) => ({
  productTags: many(productTag),
}));

export type Organization = typeof organization.$inferSelect;
export type Role = (typeof role.enumValues)[number];
export type Member = typeof member.$inferSelect & {
  user: typeof user.$inferSelect;
};
export type User = typeof user.$inferSelect;
export type Product = typeof product.$inferSelect;
export type ProductLike = typeof productLike.$inferSelect;
export type Tag = typeof tag.$inferSelect;
export type Status = (typeof status.enumValues)[number];
export type Order = typeof order.$inferSelect;
export type OrderItem = typeof orderItem.$inferSelect;
export type OrderStatus = (typeof orderStatus.enumValues)[number];

export const schema = {
  user,
  session,
  account,
  verification,
  organization,
  member,
  invitation,
  product,
  productLike,
  tag,
  productTag,
  order,
  orderItem,
  organizationRelations,
  memberRelations,
  invitationRelations,
  productRelations,
  productLikeRelations,
  tagRelations,
  orderRelations,
  orderItemRelations,
};
