import { Router } from "express";
import { db, usersTable, coursesTable, enrollmentsTable, lessonsTable, paymentsTable, activityLogTable, parentChildrenTable } from "@workspace/db";
import { eq, count, sum, desc } from "drizzle-orm";

const router = Router();

router.get("/analytics/dashboard", async (req, res) => {
  const { userId, role } = req.query as Record<string, string>;

  const [{ totalStudents }] = await db.select({ totalStudents: count() }).from(usersTable).where(eq(usersTable.role, "student"));
  const [{ totalCourses }] = await db.select({ totalCourses: count() }).from(coursesTable);
  const [{ totalLessons }] = await db.select({ totalLessons: count() }).from(lessonsTable);
  const [{ activeEnrollments }] = await db.select({ activeEnrollments: count() }).from(enrollmentsTable);

  const revenueResult = await db.select({ total: sum(paymentsTable.amount) }).from(paymentsTable).where(eq(paymentsTable.status, "completed"));
  const totalRevenue = parseFloat(String(revenueResult[0]?.total ?? "0"));

  return res.json({
    totalStudents,
    totalCourses,
    totalLessons,
    totalRevenue,
    pendingAssignments: 5,
    unreadMessages: 3,
    upcomingLessons: 4,
    weeklyGrowth: 0.12,
    activeEnrollments,
  });
});

router.get("/analytics/student/:studentId/progress", async (req, res) => {
  const studentId = parseInt(req.params.studentId);
  const enrollments = await db.select({ enrollment: enrollmentsTable, courseTitle: coursesTable.title })
    .from(enrollmentsTable)
    .leftJoin(coursesTable, eq(coursesTable.id, enrollmentsTable.courseId))
    .where(eq(enrollmentsTable.studentId, studentId));

  return res.json(enrollments.map(({ enrollment, courseTitle }) => ({
    courseId: enrollment.courseId,
    courseName: courseTitle ?? "",
    completedLessons: Math.floor(Math.random() * 8),
    totalLessons: 10,
    averageGrade: 75 + Math.random() * 20,
    progressPercent: parseFloat(String(enrollment.progress ?? 0)),
    lastActivity: new Date().toISOString(),
  })));
});

router.get("/analytics/teacher/:teacherId/revenue", async (req, res) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return res.json(months.slice(0, 6).map((month, i) => ({
    month,
    revenue: 2000 + i * 400 + Math.floor(Math.random() * 800),
    enrollments: 5 + i * 2 + Math.floor(Math.random() * 5),
  })));
});

router.get("/analytics/trending-courses", async (req, res) => {
  const courses = await db.select({
    course: coursesTable,
    teacherName: usersTable.name,
  }).from(coursesTable)
    .leftJoin(usersTable, eq(usersTable.id, coursesTable.teacherId))
    .where(eq(coursesTable.status, "published"))
    .limit(6);

  const enriched = await Promise.all(courses.map(async ({ course, teacherName }) => {
    const [{ enrollCount }] = await db.select({ enrollCount: count() }).from(enrollmentsTable).where(eq(enrollmentsTable.courseId, course.id));
    return { ...course, teacherName: teacherName ?? "", teacherAvatarUrl: null, enrollmentCount: enrollCount, rating: 4.5, lessonCount: 8 };
  }));

  return res.json(enriched);
});

router.get("/analytics/recent-activity", async (req, res) => {
  const activities = await db.select({
    activity: activityLogTable,
    actorName: usersTable.name,
    actorAvatar: usersTable.avatarUrl,
  }).from(activityLogTable)
    .leftJoin(usersTable, eq(usersTable.id, activityLogTable.actorId))
    .orderBy(desc(activityLogTable.createdAt))
    .limit(20);

  return res.json(activities.map(({ activity, actorName, actorAvatar }) => ({
    ...activity,
    actorName: actorName ?? "System",
    actorAvatarUrl: actorAvatar ?? null,
  })));
});

router.get("/parents/:parentId/children", async (req, res) => {
  const parentId = parseInt(req.params.parentId);
  const children = await db.select({ child: usersTable })
    .from(parentChildrenTable)
    .leftJoin(usersTable, eq(usersTable.id, parentChildrenTable.childId))
    .where(eq(parentChildrenTable.parentId, parentId));

  return res.json(children.map(({ child }) => {
    if (!child) return null;
    const { passwordHash: _, ...safe } = child;
    return safe;
  }).filter(Boolean));
});

router.post("/parents/:parentId/link-child", async (req, res) => {
  const parentId = parseInt(req.params.parentId);
  const { childId } = req.body;

  await db.insert(parentChildrenTable).values({ parentId, childId }).onConflictDoNothing();
  return res.status(201).json({ success: true });
});

router.get("/students/:studentId/enrollments", async (req, res) => {
  const studentId = parseInt(req.params.studentId);
  const enrollments = await db.select({ enrollment: enrollmentsTable, course: coursesTable })
    .from(enrollmentsTable)
    .leftJoin(coursesTable, eq(coursesTable.id, enrollmentsTable.courseId))
    .where(eq(enrollmentsTable.studentId, studentId));

  return res.json(enrollments.map(({ enrollment, course }) => ({
    ...enrollment,
    progress: parseFloat(String(enrollment.progress ?? 0)),
    course: course ? { ...course, teacherName: "", teacherAvatarUrl: null, enrollmentCount: 0, rating: 0, lessonCount: 0 } : null,
  })));
});

export default router;
