import { Router } from "express";
import { db, coursesTable, enrollmentsTable, usersTable } from "@workspace/db";
import { eq, and, ilike, count, sql } from "drizzle-orm";
import { CreateCourseBody, UpdateCourseBody, EnrollInCourseBody } from "@workspace/api-zod";

const router = Router();

router.get("/courses", async (req, res) => {
  const { teacherId, subject, gradeLevel, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  const conditions = [
    teacherId ? eq(coursesTable.teacherId, parseInt(teacherId)) : undefined,
    subject ? ilike(coursesTable.subject, `%${subject}%`) : undefined,
    gradeLevel ? eq(coursesTable.gradeLevel, gradeLevel) : undefined,
    search ? ilike(coursesTable.title, `%${search}%`) : undefined,
  ].filter(Boolean) as any[];

  const courses = await db.select({
    course: coursesTable,
    teacherName: usersTable.name,
    teacherAvatar: usersTable.avatarUrl,
  }).from(coursesTable)
    .leftJoin(usersTable, eq(usersTable.id, coursesTable.teacherId))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limitNum)
    .offset(offset);

  const [{ total }] = await db.select({ total: count() }).from(coursesTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const enriched = await Promise.all(courses.map(async ({ course, teacherName, teacherAvatar }) => {
    const [{ enrollCount }] = await db.select({ enrollCount: count() }).from(enrollmentsTable).where(eq(enrollmentsTable.courseId, course.id));
    return {
      ...course,
      teacherName: teacherName ?? "Unknown",
      teacherAvatarUrl: teacherAvatar ?? null,
      enrollmentCount: enrollCount,
      rating: 4.5,
      lessonCount: 8,
    };
  }));

  return res.json({ courses: enriched, total, page: pageNum, limit: limitNum });
});

router.post("/courses", async (req, res) => {
  const parsed = CreateCourseBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const teacherId = parseInt(req.headers["x-user-id"] as string ?? "1");

  const [course] = await db.insert(coursesTable).values({
    ...parsed.data,
    teacherId,
    price: String(parsed.data.price ?? 0),
  }).returning();

  return res.status(201).json({ ...course, teacherName: "", enrollmentCount: 0, rating: 0, lessonCount: 0 });
});

router.get("/courses/:courseId", async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const [row] = await db.select({ course: coursesTable, teacherName: usersTable.name, teacherAvatar: usersTable.avatarUrl })
    .from(coursesTable).leftJoin(usersTable, eq(usersTable.id, coursesTable.teacherId))
    .where(eq(coursesTable.id, courseId)).limit(1);

  if (!row) return res.status(404).json({ error: "Course not found" });

  const [{ enrollCount }] = await db.select({ enrollCount: count() }).from(enrollmentsTable).where(eq(enrollmentsTable.courseId, courseId));

  return res.json({ ...row.course, teacherName: row.teacherName ?? "", teacherAvatarUrl: row.teacherAvatar ?? null, enrollmentCount: enrollCount, rating: 4.6, lessonCount: 8 });
});

router.patch("/courses/:courseId", async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const parsed = UpdateCourseBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updateData: any = { ...parsed.data };
  if (updateData.price !== undefined) updateData.price = String(updateData.price);

  const [updated] = await db.update(coursesTable).set(updateData).where(eq(coursesTable.id, courseId)).returning();
  if (!updated) return res.status(404).json({ error: "Not found" });

  return res.json({ ...updated, teacherName: "", enrollmentCount: 0, rating: 0, lessonCount: 0 });
});

router.delete("/courses/:courseId", async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  await db.delete(coursesTable).where(eq(coursesTable.id, courseId));
  return res.status(204).send();
});

router.post("/courses/:courseId/enroll", async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const parsed = EnrollInCourseBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [enrollment] = await db.insert(enrollmentsTable).values({
    courseId,
    studentId: parsed.data.studentId,
  }).returning();

  const [course] = await db.select().from(coursesTable).where(eq(coursesTable.id, courseId)).limit(1);
  return res.status(201).json({ ...enrollment, course: { ...course, teacherName: "", enrollmentCount: 0, rating: 0, lessonCount: 0 } });
});

router.get("/courses/:courseId/students", async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const students = await db.select({
    studentId: enrollmentsTable.studentId,
    enrolledAt: enrollmentsTable.enrolledAt,
    progress: enrollmentsTable.progress,
    studentName: usersTable.name,
    studentAvatar: usersTable.avatarUrl,
  }).from(enrollmentsTable)
    .leftJoin(usersTable, eq(usersTable.id, enrollmentsTable.studentId))
    .where(eq(enrollmentsTable.courseId, courseId));

  return res.json(students.map(s => ({
    studentId: s.studentId,
    studentName: s.studentName ?? "",
    studentAvatarUrl: s.studentAvatar ?? null,
    enrolledAt: s.enrolledAt,
    progress: parseFloat(String(s.progress ?? "0")),
    lastActive: new Date().toISOString(),
  })));
});

export default router;
