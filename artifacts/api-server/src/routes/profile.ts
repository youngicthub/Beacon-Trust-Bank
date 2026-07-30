import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { authenticate } from "../middleware/auth";

const router: IRouter = Router();
router.use(authenticate);

router.patch("/", async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, phone, address } = req.body as {
    firstName?: string; lastName?: string; phone?: string; address?: string;
  };
  try {
    const [updated] = await db
      .update(usersTable)
      .set({
        firstName: firstName ?? req.user!.firstName,
        lastName: lastName ?? req.user!.lastName,
        phone: phone ?? req.user!.phone,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, req.user!.id))
      .returning();
    const { passwordHash: _ph, pinHash: _pin, ...safe } = updated;
    res.json(safe);
  } catch {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.patch("/password", async (req: Request, res: Response): Promise<void> => {
  const { newPassword } = req.body as { newPassword?: string };
  if (!newPassword || newPassword.length < 8) {
    res.status(400).json({ error: "newPassword must be at least 8 characters" });
    return;
  }
  try {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db
      .update(usersTable)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(usersTable.id, req.user!.id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update password" });
  }
});

export default router;
