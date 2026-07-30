import { Router, type IRouter, type Request, type Response } from "express";
import { db, supportTicketsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

const router: IRouter = Router();
router.use(authenticate);

router.get("/tickets", async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(supportTicketsTable)
      .where(eq(supportTicketsTable.userId, req.user!.id))
      .orderBy(desc(supportTicketsTable.createdAt));
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch support tickets" });
  }
});

router.post("/tickets", async (req: Request, res: Response): Promise<void> => {
  const { subject, description, priority } = req.body as {
    subject?: string; description?: string; priority?: string;
  };
  if (!subject || !description) {
    res.status(400).json({ error: "subject and description are required" });
    return;
  }
  try {
    const [ticket] = await db
      .insert(supportTicketsTable)
      .values({
        userId: req.user!.id,
        subject,
        description,
        priority: (priority ?? "medium") as "low" | "medium" | "high" | "urgent",
        status: "open",
      })
      .returning();
    res.status(201).json(ticket);
  } catch {
    res.status(500).json({ error: "Failed to create support ticket" });
  }
});

router.post("/chat", async (_req: Request, res: Response): Promise<void> => {
  // Stub: AI concierge is not yet configured. Return a helpful static response.
  res.json({
    reply:
      "Thank you for reaching out to Beacon Trust. Our AI concierge is currently being set up. " +
      "For immediate assistance, please open a support ticket from your dashboard or contact us at support@beacontrust.com.",
  });
});

export default router;
