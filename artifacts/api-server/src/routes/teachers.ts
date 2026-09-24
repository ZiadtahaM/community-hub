import { Router } from "express";
import { db, usersTable, coursesTable, enrollmentsTable } from "@workspace/db";
import { eq, and, ilike, sql, count, avg } from "drizzle-orm";

const router = Router();

router.get("/teachers", async (req, res) => {
  const { subject, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const offset = (pageNum - 1) * limitNum;

  let query = db.select().from(usersTable).where(eq(usersTable.role, "teacher"));

  const teachers = await db.select().from(usersTable)
    .where(
      and(
        eq(usersTable.role, "teacher"),
        search ? ilike(usersTable.name, `%${search}%`) : undefined,
      )
    )
    .limit(limitNum)
    .offset(offset);

  const teacherProfiles = await Promise.all(teachers.map(async (t) => {
    const { passwordHash: _, ...user } = t;
    const [courseStats] = await db.select({
      totalCourses: count(coursesTable.id),
    }).from(coursesTable).where(eq(coursesTable.teacherId, t.id));

    const [studentStats] = await db.select({
      totalStudents: count(enrollmentsTable.id),
    }).from(enrollmentsTable)
      .innerJoin(coursesTable, eq(coursesTable.id, enrollmentsTable.courseId))
      .where(eq(coursesTable.teacherId, t.id));

    return {
      user,
      subject: subject ?? "General",
      totalStudents: studentStats?.totalStudents ?? 0,
      totalCourses: courseStats?.totalCourses ?? 0,
      rating: 4.5 + Math.random() * 0.4,
      reviewCount: Math.floor(Math.random() * 120) + 10,
      hourlyRate: 100 + Math.floor(Math.random() * 200),
      currency: "EGP",
      tags: ["Mathematics", "Algebra"],
    };
  }));

  const [{ total }] = await db.select({ total: count() }).from(usersTable).where(eq(usersTable.role, "teacher"));

  return res.json({ teachers: teacherProfiles, total, page: pageNum, limit: limitNum });
});

router.get("/teachers/:teacherId", async (req, res) => {
  const teacherId = parseInt(req.params.teacherId);
  const [teacher] = await db.select().from(usersTable).where(and(eq(usersTable.id, teacherId), eq(usersTable.role, "teacher"))).limit(1);
  if (!teacher) return res.status(404).json({ error: "Teacher not found" });

  const { passwordHash: _, ...user } = teacher;
  const [courseStats] = await db.select({ totalCourses: count(coursesTable.id) }).from(coursesTable).where(eq(coursesTable.teacherId, teacherId));
  const [studentStats] = await db.select({ totalStudents: count(enrollmentsTable.id) }).from(enrollmentsTable)
    .innerJoin(coursesTable, eq(coursesTable.id, enrollmentsTable.courseId))
    .where(eq(coursesTable.teacherId, teacherId));

  return res.json({
    user,
    subject: "Mathematics",
    gradeLevel: "9-12",
    yearsExperience: 8,
    rating: 4.8,
    reviewCount: 67,
    totalStudents: studentStats?.totalStudents ?? 0,
    totalCourses: courseStats?.totalCourses ?? 0,
    hourlyRate: 200,
    currency: "EGP",
    tags: ["Algebra", "Calculus", "Geometry"],
  });
});

router.get("/teachers/:teacherId/stats", async (req, res) => {
  const teacherId = parseInt(req.params.teacherId);

  const [activeCourses] = await db.select({ count: count() }).from(coursesTable)
    .where(and(eq(coursesTable.teacherId, teacherId), eq(coursesTable.status, "published")));

  const [studentCount] = await db.select({ count: count() }).from(enrollmentsTable)
    .innerJoin(coursesTable, eq(coursesTable.id, enrollmentsTable.courseId))
    .where(eq(coursesTable.teacherId, teacherId));

  return res.json({
    totalStudents: studentCount?.count ?? 0,
    activeCourses: activeCourses?.count ?? 0,
    pendingAssignments: 3,
    monthlyRevenue: 4800,
    averageRating: 4.8,
    completionRate: 0.74,
    unreadMessages: 2,
    upcomingLessons: 4,
  });
});

export default router;
