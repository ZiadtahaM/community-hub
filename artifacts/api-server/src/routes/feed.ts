import { Router } from "express";
import { db, feedPostsTable, feedLikesTable, commentsTable, usersTable } from "@workspace/db";
import { eq, and, count, desc } from "drizzle-orm";
import { CreateFeedPostBody, CreateCommentBody } from "@workspace/api-zod";

const router = Router();

router.get("/feed", async (req, res) => {
  const { category, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  const posts = await db.select({
    post: feedPostsTable,
    authorName: usersTable.name,
    authorAvatar: usersTable.avatarUrl,
    authorRole: usersTable.role,
  }).from(feedPostsTable)
    .leftJoin(usersTable, eq(usersTable.id, feedPostsTable.authorId))
    .where(category ? eq(feedPostsTable.category, category as any) : undefined)
    .orderBy(desc(feedPostsTable.createdAt))
    .limit(limitNum)
    .offset(offset);

  const enriched = await Promise.all(posts.map(async ({ post, authorName, authorAvatar, authorRole }) => {
    const [{ commentCount }] = await db.select({ commentCount: count() }).from(commentsTable).where(eq(commentsTable.postId, post.id));
    return {
      ...post,
      authorName: authorName ?? "",
      authorAvatarUrl: authorAvatar ?? null,
      authorRole: authorRole ?? "student",
      commentCount,
      liked: false,
      tags: [],
    };
  }));

  const [{ total }] = await db.select({ total: count() }).from(feedPostsTable)
    .where(category ? eq(feedPostsTable.category, category as any) : undefined);

  return res.json({ posts: enriched, total, page: pageNum, limit: limitNum });
});

router.post("/feed", async (req, res) => {
  const parsed = CreateFeedPostBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [post] = await db.insert(feedPostsTable).values(parsed.data as any).returning();
  return res.status(201).json({ ...post, authorName: "", authorAvatarUrl: null, authorRole: "student", commentCount: 0, liked: false, tags: [] });
});

router.get("/feed/:postId", async (req, res) => {
  const [row] = await db.select({ post: feedPostsTable, authorName: usersTable.name, authorAvatar: usersTable.avatarUrl, authorRole: usersTable.role })
    .from(feedPostsTable).leftJoin(usersTable, eq(usersTable.id, feedPostsTable.authorId))
    .where(eq(feedPostsTable.id, parseInt(req.params.postId))).limit(1);

  if (!row) return res.status(404).json({ error: "Not found" });
  const [{ commentCount }] = await db.select({ commentCount: count() }).from(commentsTable).where(eq(commentsTable.postId, row.post.id));
  return res.json({ ...row.post, authorName: row.authorName ?? "", authorAvatarUrl: row.authorAvatar ?? null, authorRole: row.authorRole ?? "student", commentCount, liked: false, tags: [] });
});

router.delete("/feed/:postId", async (req, res) => {
  await db.delete(feedPostsTable).where(eq(feedPostsTable.id, parseInt(req.params.postId)));
  return res.status(204).send();
});

router.post("/feed/:postId/like", async (req, res) => {
  const postId = parseInt(req.params.postId);
  const userId = parseInt(req.body.userId ?? "1");

  const existing = await db.select().from(feedLikesTable).where(and(eq(feedLikesTable.postId, postId), eq(feedLikesTable.userId, userId))).limit(1);

  if (existing.length > 0) {
    await db.delete(feedLikesTable).where(and(eq(feedLikesTable.postId, postId), eq(feedLikesTable.userId, userId)));
    await db.update(feedPostsTable).set({ likes: db.$count(feedLikesTable, eq(feedLikesTable.postId, postId)) as any }).where(eq(feedPostsTable.id, postId));
    const [post] = await db.select().from(feedPostsTable).where(eq(feedPostsTable.id, postId)).limit(1);
    return res.json({ liked: false, likes: post?.likes ?? 0 });
  } else {
    await db.insert(feedLikesTable).values({ postId, userId });
    const [updated] = await db.update(feedPostsTable).set({ likes: (await db.select({ likes: feedPostsTable.likes }).from(feedPostsTable).where(eq(feedPostsTable.id, postId)).limit(1))[0]!.likes + 1 }).where(eq(feedPostsTable.id, postId)).returning();
    return res.json({ liked: true, likes: updated?.likes ?? 1 });
  }
});

router.get("/feed/:postId/comments", async (req, res) => {
  const postId = parseInt(req.params.postId);
  const comments = await db.select({ comment: commentsTable, authorName: usersTable.name, authorAvatar: usersTable.avatarUrl })
    .from(commentsTable).leftJoin(usersTable, eq(usersTable.id, commentsTable.authorId))
    .where(eq(commentsTable.postId, postId)).orderBy(commentsTable.createdAt);

  return res.json(comments.map(({ comment, authorName, authorAvatar }) => ({
    ...comment,
    authorName: authorName ?? "",
    authorAvatarUrl: authorAvatar ?? null,
  })));
});

router.post("/feed/:postId/comments", async (req, res) => {
  const postId = parseInt(req.params.postId);
  const parsed = CreateCommentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [comment] = await db.insert(commentsTable).values({ ...parsed.data, postId }).returning();
  return res.status(201).json({ ...comment, authorName: "", authorAvatarUrl: null });
});

export default router;
