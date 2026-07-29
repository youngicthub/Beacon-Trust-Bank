import { Router, type IRouter, type Request, type Response } from "express";
import { db, beneficiariesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

const router: IRouter = Router();

// GET /api/beneficiaries
router.get("/", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const beneficiaries = await db.query.beneficiariesTable.findMany({
      where: eq(beneficiariesTable.userId, req.user!.id),
    });
    res.json({ beneficiaries });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/beneficiaries
router.post("/", authenticate, async (req: Request, res: Response): Promise<void> => {
  const { name, account_number, bank_name, email } = req.body as {
    name?: string;
    account_number?: string;
    bank_name?: string;
    email?: string;
  };
  if (!name || !account_number) {
    res.status(400).json({ error: "name and account_number are required" });
    return;
  }
  try {
    const [beneficiary] = await db
      .insert(beneficiariesTable)
      .values({
        userId: req.user!.id,
        name,
        accountNumber: account_number,
        bankName: bank_name ?? null,
        email: email ?? null,
      })
      .returning();
    res.status(201).json({ beneficiary });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/beneficiaries/:id
router.delete("/:id", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const beneficiary = await db.query.beneficiariesTable.findFirst({
      where: and(
        eq(beneficiariesTable.id, req.params["id"]!),
        eq(beneficiariesTable.userId, req.user!.id),
      ),
    });
    if (!beneficiary) {
      res.status(404).json({ error: "Beneficiary not found" });
      return;
    }
    await db
      .delete(beneficiariesTable)
      .where(eq(beneficiariesTable.id, beneficiary.id));
    res.status(204).end();
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
