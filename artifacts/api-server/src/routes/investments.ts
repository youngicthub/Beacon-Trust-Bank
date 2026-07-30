import { Router, type IRouter, type Request, type Response } from "express";
import { db, investmentsTable, accountsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

const router: IRouter = Router();
router.use(authenticate);

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(investmentsTable)
      .where(eq(investmentsTable.userId, req.user!.id))
      .orderBy(desc(investmentsTable.createdAt));
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch investments" });
  }
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { type, amount } = req.body as { type?: string; amount?: number };
  if (!type || !amount || amount <= 0) {
    res.status(400).json({ error: "type and positive amount are required" });
    return;
  }
  try {
    const [investment] = await db
      .insert(investmentsTable)
      .values({
        userId: req.user!.id,
        type: type as "mutualFund" | "fixedDeposit" | "stocks" | "bonds" | "crypto",
        amount: String(amount),
        status: "active",
      })
      .returning();
    res.status(201).json(investment);
  } catch {
    res.status(500).json({ error: "Failed to create investment" });
  }
});

export default router;
