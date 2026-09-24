import { Router } from "express";
import { db, announcementsTable, conversationsTable, conversationParticipantsTable, messagesTable, usersTable } from "@workspace/db";
import { eq, and, count, desc } from "drizzle-orm";
import { CreateAnnouncementBody, SendMessageBody, StartConversationBody } from "@workspace/api-zod";

const router = Router();

router.get("/courses/:courseId/announcements", async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const announcements = await db.select({
    ann: announcementsTable,
    authorName: usersTable.name,
    authorAvatar: usersTable.avatarUrl,
  }).from(announcementsTable)
    .leftJoin(usersTable, eq(usersTable.id, announcementsTable.authorId))
    .where(eq(announcementsTable.courseId, courseId))
    .orderBy(desc(announcementsTable.createdAt));

  return res.json(announcements.map(({ ann, authorName, authorAvatar }) => ({
    ...ann,
    authorName: authorName ?? "",
    authorAvatarUrl: authorAvatar ?? null,
  })));
});

router.post("/courses/:courseId/announcements", async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const parsed = CreateAnnouncementBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [ann] = await db.insert(announcementsTable).values({ ...parsed.data, courseId }).returning();
  return res.status(201).json({ ...ann, authorName: "", authorAvatarUrl: null });
});

router.get("/messages/conversations", async (req, res) => {
  const conversations = await db.select().from(conversationsTable).orderBy(desc(conversationsTable.lastMessageAt)).limit(20);

  const enriched = await Promise.all(conversations.map(async (conv) => {
    const participants = await db.select({ userId: conversationParticipantsTable.userId, name: usersTable.name, avatar: usersTable.avatarUrl })
      .from(conversationParticipantsTable)
      .leftJoin(usersTable, eq(usersTable.id, conversationParticipantsTable.userId))
      .where(eq(conversationParticipantsTable.conversationId, conv.id));

    const [lastMsg] = await db.select().from(messagesTable).where(eq(messagesTable.conversationId, conv.id)).orderBy(desc(messagesTable.sentAt)).limit(1);
    const [{ unread }] = await db.select({ unread: count() }).from(messagesTable).where(and(eq(messagesTable.conversationId, conv.id), eq(messagesTable.read, false)));

    return {
      id: conv.id,
      participantIds: participants.map(p => p.userId),
      participantNames: participants.map(p => p.name ?? ""),
      participantAvatars: participants.map(p => p.avatar ?? ""),
      lastMessage: lastMsg?.body ?? "",
      lastMessageAt: conv.lastMessageAt,
      unreadCount: unread,
    };
  }));

  return res.json(enriched);
});

router.get("/messages/conversations/:conversationId", async (req, res) => {
  const convId = parseInt(req.params.conversationId);
  const messages = await db.select({
    msg: messagesTable,
    senderName: usersTable.name,
    senderAvatar: usersTable.avatarUrl,
  }).from(messagesTable)
    .leftJoin(usersTable, eq(usersTable.id, messagesTable.senderId))
    .where(eq(messagesTable.conversationId, convId))
    .orderBy(messagesTable.sentAt);

  return res.json(messages.map(({ msg, senderName, senderAvatar }) => ({
    ...msg,
    senderName: senderName ?? "",
    senderAvatarUrl: senderAvatar ?? null,
  })));
});

router.post("/messages/conversations/:conversationId", async (req, res) => {
  const convId = parseInt(req.params.conversationId);
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [msg] = await db.insert(messagesTable).values({ conversationId: convId, senderId: parsed.data.senderId, body: parsed.data.body }).returning();
  await db.update(conversationsTable).set({ lastMessageAt: new Date() }).where(eq(conversationsTable.id, convId));

  return res.status(201).json({ ...msg, senderName: "", senderAvatarUrl: null });
});

router.post("/messages/start", async (req, res) => {
  const parsed = StartConversationBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [conv] = await db.insert(conversationsTable).values({}).returning();
  await db.insert(conversationParticipantsTable).values([
    { conversationId: conv.id, userId: parsed.data.initiatorId },
    { conversationId: conv.id, userId: parsed.data.recipientId },
  ]);
  await db.insert(messagesTable).values({ conversationId: conv.id, senderId: parsed.data.initiatorId, body: parsed.data.firstMessage });

  return res.status(201).json({ id: conv.id, participantIds: [parsed.data.initiatorId, parsed.data.recipientId], participantNames: [], participantAvatars: [], lastMessage: parsed.data.firstMessage, lastMessageAt: conv.lastMessageAt, unreadCount: 0 });
});

export default router;
