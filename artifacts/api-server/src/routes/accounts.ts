import { Router, type IRouter, type Request, type Response } from "express";
import { db, accountsTable, transactionsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

const router: IRouter = Router();

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
