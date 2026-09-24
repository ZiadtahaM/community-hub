import { Router } from "express";
import { db, paymentsTable, coursesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { CreatePaymentBody, UpdatePaymentBody } from "@workspace/api-zod";

const router = Router();

router.get("/payments", async (req, res) => {
  const { userId, status } = req.query as Record<string, string>;
  const conditions = [
    userId ? eq(paymentsTable.studentId, parseInt(userId)) : undefined,
    status ? eq(paymentsTable.status, status as any) : undefined,
  ].filter(Boolean) as any[];

  const payments = await db.select({ payment: paymentsTable, courseName: coursesTable.title })
    .from(paymentsTable)
    .leftJoin(coursesTable, eq(coursesTable.id, paymentsTable.courseId))
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return res.json(payments.map(({ payment, courseName }) => ({
    ...payment,
    courseName: courseName ?? "",
    amount: parseFloat(String(payment.amount)),
  })));
});

router.post("/payments", async (req, res) => {
  const parsed = CreatePaymentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [payment] = await db.insert(paymentsTable).values({
    ...parsed.data,
    amount: String(parsed.data.amount),
  }).returning();

  return res.status(201).json({ ...payment, courseName: "", amount: parseFloat(String(payment.amount)) });
});

router.patch("/payments/:paymentId", async (req, res) => {
  const parsed = UpdatePaymentBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [updated] = await db.update(paymentsTable).set(parsed.data as any).where(eq(paymentsTable.id, parseInt(req.params.paymentId))).returning();
  if (!updated) return res.status(404).json({ error: "Not found" });
  return res.json({ ...updated, courseName: "", amount: parseFloat(String(updated.amount)) });
});

export default router;
