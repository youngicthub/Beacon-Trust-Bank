import { Router, type IRouter, type Request, type Response } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

const router: IRouter = Router();
router.use(authenticate);

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, req.user!.id))
      .orderBy(desc(notificationsTable.createdAt));
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

router.patch("/:id/read", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, req.user!.id)));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

router.patch("/read-all", async (req: Request, res: Response): Promise<void> => {
  try {
    await db
      .update(notificationsTable)
      .set({ isRead: true })
      .where(and(eq(notificationsTable.userId, req.user!.id), eq(notificationsTable.isRead, false)));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});

export default router;
