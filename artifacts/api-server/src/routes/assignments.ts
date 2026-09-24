import { Router } from "express";
import { db, assignmentsTable, submissionsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateAssignmentBody, UpdateAssignmentBody, SubmitAssignmentBody, GradeSubmissionBody } from "@workspace/api-zod";

const router = Router();

router.get("/courses/:courseId/assignments", async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const assignments = await db.select().from(assignmentsTable).where(eq(assignmentsTable.courseId, courseId));
  return res.json(assignments.map(a => ({
    ...a,
    maxGrade: parseFloat(String(a.maxGrade)),
    submissionCount: 0,
    gradedCount: 0,
  })));
});

router.post("/courses/:courseId/assignments", async (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const parsed = CreateAssignmentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [assignment] = await db.insert(assignmentsTable).values({
    ...parsed.data,
    courseId,
    maxGrade: String(parsed.data.maxGrade),
  }).returning();

  return res.status(201).json({ ...assignment, maxGrade: parseFloat(String(assignment.maxGrade)), submissionCount: 0, gradedCount: 0 });
});

router.get("/assignments/:assignmentId", async (req, res) => {
  const [a] = await db.select().from(assignmentsTable).where(eq(assignmentsTable.id, parseInt(req.params.assignmentId))).limit(1);
  if (!a) return res.status(404).json({ error: "Not found" });
  return res.json({ ...a, maxGrade: parseFloat(String(a.maxGrade)), submissionCount: 0, gradedCount: 0 });
});

router.patch("/assignments/:assignmentId", async (req, res) => {
  const parsed = UpdateAssignmentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const updateData: any = { ...parsed.data };
  if (updateData.maxGrade !== undefined) updateData.maxGrade = String(updateData.maxGrade);

  const [updated] = await db.update(assignmentsTable).set(updateData).where(eq(assignmentsTable.id, parseInt(req.params.assignmentId))).returning();
  if (!updated) return res.status(404).json({ error: "Not found" });
  return res.json({ ...updated, maxGrade: parseFloat(String(updated.maxGrade)), submissionCount: 0, gradedCount: 0 });
});

router.get("/assignments/:assignmentId/submissions", async (req, res) => {
  const assignmentId = parseInt(req.params.assignmentId);
  const subs = await db.select({
    sub: submissionsTable,
    studentName: usersTable.name,
  }).from(submissionsTable)
    .leftJoin(usersTable, eq(usersTable.id, submissionsTable.studentId))
    .where(eq(submissionsTable.assignmentId, assignmentId));

  return res.json(subs.map(({ sub, studentName }) => ({
    ...sub,
    studentName: studentName ?? "",
    grade: sub.grade ? parseFloat(String(sub.grade)) : null,
  })));
});

router.post("/assignments/:assignmentId/submissions", async (req, res) => {
  const assignmentId = parseInt(req.params.assignmentId);
  const parsed = SubmitAssignmentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [sub] = await db.insert(submissionsTable).values({
    assignmentId,
    studentId: parsed.data.studentId,
    content: parsed.data.content,
    fileUrl: parsed.data.fileUrl ?? null,
  }).returning();

  return res.status(201).json({ ...sub, studentName: "", grade: null });
});

router.patch("/submissions/:submissionId/grade", async (req, res) => {
  const parsed = GradeSubmissionBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [updated] = await db.update(submissionsTable).set({
    grade: String(parsed.data.grade),
    feedback: parsed.data.feedback ?? null,
    status: "graded",
    gradedAt: new Date(),
  }).where(eq(submissionsTable.id, parseInt(req.params.submissionId))).returning();

  if (!updated) return res.status(404).json({ error: "Not found" });
  return res.json({ ...updated, grade: parseFloat(String(updated.grade)), studentName: "" });
});

export default router;
