import { Router, type IRouter, type Request, type Response } from "express";
import { db, loansTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

const router: IRouter = Router();
router.use(authenticate);

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(loansTable)
      .where(eq(loansTable.userId, req.user!.id))
      .orderBy(desc(loansTable.createdAt));
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch loans" });
  }
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { type, amount, tenureMonths, purpose } = req.body as {
    type?: string; amount?: number; tenureMonths?: number; purpose?: string;
  };
  if (!type || !amount || !tenureMonths) {
    res.status(400).json({ error: "type, amount, and tenureMonths are required" });
    return;
  }
  try {
    const interestRate = 8.5;
    const monthlyRate = interestRate / 100 / 12;
    const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
      (Math.pow(1 + monthlyRate, tenureMonths) - 1);

    const [loan] = await db
      .insert(loansTable)
      .values({
        userId: req.user!.id,
        type: type as "personal" | "home" | "auto" | "education" | "business",
        amount: String(amount),
        interestRate: String(interestRate),
        tenureMonths,
        purpose: purpose ?? null,
        status: "pending",
        emiAmount: String(Math.round(emi * 100) / 100),
        outstandingAmount: String(amount),
      })
      .returning();
    res.status(201).json(loan);
  } catch {
    res.status(500).json({ error: "Failed to submit loan application" });
  }
});

export default router;
