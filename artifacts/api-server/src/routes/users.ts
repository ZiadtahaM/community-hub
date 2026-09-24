import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { UpdateUserBody } from "@workspace/api-zod";

const router = Router();

router.get("/users/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) return res.status(404).json({ error: "User not found" });
  const { passwordHash: _, ...safe } = user;
  return res.json(safe);
});

router.patch("/users/:userId", async (req, res) => {
  const userId = parseInt(req.params.userId);
  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const [updated] = await db.update(usersTable).set(parsed.data as any).where(eq(usersTable.id, userId)).returning();
  if (!updated) return res.status(404).json({ error: "User not found" });
  const { passwordHash: _, ...safe } = updated;
  return res.json(safe);
});

export default router;
