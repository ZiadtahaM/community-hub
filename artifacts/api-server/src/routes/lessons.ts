import { Router } from "express";
import { db, lessonsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateLessonBody, UpdateLessonBody } from "@workspace/api-zod";

const router = Router();

router.get("/courses/:courseId/lessons", async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const lessons = await db.select().from(lessonsTable).where(eq(lessonsTable.courseId, courseId)).orderBy(lessonsTable.order);
  return res.json(lessons);
});

router.post("/courses/:courseId/lessons", async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const parsed = CreateLessonBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [lesson] = await db.insert(lessonsTable).values({ ...parsed.data, courseId }).returning();
  return res.status(201).json(lesson);
});

router.get("/lessons/:lessonId", async (req, res) => {
  const lessonId = parseInt(req.params.lessonId);
  const [lesson] = await db.select().from(lessonsTable).where(eq(lessonsTable.id, lessonId)).limit(1);
  if (!lesson) return res.status(404).json({ error: "Lesson not found" });
  return res.json(lesson);
});

router.patch("/lessons/:lessonId", async (req, res) => {
  const lessonId = parseInt(req.params.lessonId);
  const parsed = UpdateLessonBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [updated] = await db.update(lessonsTable).set(parsed.data as any).where(eq(lessonsTable.id, lessonId)).returning();
  if (!updated) return res.status(404).json({ error: "Not found" });
  return res.json(updated);
});

router.delete("/lessons/:lessonId", async (req, res) => {
  await db.delete(lessonsTable).where(eq(lessonsTable.id, parseInt(req.params.lessonId)));
  return res.status(204).send();
});

export default router;
