import { pgTable, serial, text, timestamp, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const feedCategoryEnum = pgEnum("feed_category", ["question", "tip", "announcement", "discussion", "resource"]);

export const feedPostsTable = pgTable("feed_posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull().references(() => usersTable.id),
  category: feedCategoryEnum("category").notNull().default("discussion"),
  title: text("title"),
  body: text("body").notNull(),
  imageUrl: text("image_url"),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const feedLikesTable = pgTable("feed_likes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => feedPostsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const commentsTable = pgTable("comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => feedPostsTable.id),
  authorId: integer("author_id").notNull().references(() => usersTable.id),
  body: text("body").notNull(),
  likes: integer("likes").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const parentChildrenTable = pgTable("parent_children", {
  id: serial("id").primaryKey(),
  parentId: integer("parent_id").notNull().references(() => usersTable.id),
  childId: integer("child_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityLogTable = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  actorId: integer("actor_id").references(() => usersTable.id),
  description: text("description").notNull(),
  descriptionAr: text("description_ar"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFeedPostSchema = createInsertSchema(feedPostsTable).omit({ id: true, createdAt: true, likes: true });
export type InsertFeedPost = z.infer<typeof insertFeedPostSchema>;
export type FeedPost = typeof feedPostsTable.$inferSelect;

export const insertCommentSchema = createInsertSchema(commentsTable).omit({ id: true, createdAt: true, likes: true });
export type InsertComment = z.infer<typeof insertCommentSchema>;
