import { Router, type IRouter, type Request, type Response } from "express";
import { db, accountsTable, transactionsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

const router: IRouter = Router();

// POST /api/accounts — request a new account
router.post("/", authenticate, async (req: Request, res: Response): Promise<void> => {
  const { type, currency } = req.body as { type?: string; currency?: string };
  if (!type || !currency) {
    res.status(400).json({ error: "type and currency are required" });
    return;
  }
  try {
    const accountNumber = String(Math.floor(1000000000 + Math.random() * 8999999999));
    const [account] = await db
      .insert(accountsTable)
      .values({
        userId: req.user!.id,
        accountNumber,
        type: type as "savings" | "current" | "business" | "investment",
        currency,
        balance: "0",
        status: "pending",
      })
      .returning();
    res.status(201).json({ account });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/accounts
router.get("/", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const accounts = await db.query.accountsTable.findMany({
      where: eq(accountsTable.userId, req.user!.id),
    });
    res.json({ accounts });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/accounts/:id
router.get("/:id", authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const account = await db.query.accountsTable.findFirst({
      where: and(
        eq(accountsTable.id, req.params["id"]!),
        eq(accountsTable.userId, req.user!.id),
      ),
    });

    if (!account) {
      res.status(404).json({ error: "Account not found" });
      return;
    }

    const transactions = await db
      .select()
      .from(transactionsTable)
      .where(eq(transactionsTable.accountId, account.id))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(20);

    res.json({ account, transactions });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
