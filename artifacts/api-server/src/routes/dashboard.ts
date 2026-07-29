import { Router, type IRouter, type Request, type Response } from "express";
import { db, accountsTable, investmentsTable, loansTable, cardsTable, transactionsTable } from "@workspace/db";
import { eq, desc, inArray } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

const router: IRouter = Router();
router.use(authenticate);

router.get("/summary", async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  try {
    const [accounts, investments, loans, cards] = await Promise.all([
      db.select({
        id: accountsTable.id, accountNumber: accountsTable.accountNumber,
        type: accountsTable.type, balance: accountsTable.balance,
        currency: accountsTable.currency, status: accountsTable.status,
      }).from(accountsTable).where(eq(accountsTable.userId, userId)),
      db.select({ currentValue: investmentsTable.currentValue, status: investmentsTable.status })
        .from(investmentsTable).where(eq(investmentsTable.userId, userId)),
      db.select({ outstandingAmount: loansTable.outstandingAmount, amount: loansTable.amount, status: loansTable.status })
        .from(loansTable).where(eq(loansTable.userId, userId)),
      db.select({ id: cardsTable.id, status: cardsTable.status })
        .from(cardsTable).where(eq(cardsTable.userId, userId)),
    ]);

    const accountIds = accounts.map(a => a.id);
    const recentTransactions = accountIds.length > 0
      ? await db.select({
          id: transactionsTable.id, description: transactionsTable.description,
          amount: transactionsTable.amount, type: transactionsTable.type,
          status: transactionsTable.status, createdAt: transactionsTable.createdAt,
        }).from(transactionsTable)
          .where(inArray(transactionsTable.accountId, accountIds))
          .orderBy(desc(transactionsTable.createdAt))
          .limit(6)
      : [];

    const totalBalance = accounts.reduce((s, a) => s + Number(a.balance ?? 0), 0);
    const investmentBalance = investments.reduce((s, i) => s + Number(i.currentValue ?? 0), 0);
    const loanOutstanding = loans
      .filter(l => l.status !== "closed" && l.status !== "rejected")
      .reduce((s, l) => s + Number(l.outstandingAmount ?? l.amount ?? 0), 0);
    const cardCount = cards.filter(c => c.status === "active").length;

    res.json({ accounts, totalBalance, investmentBalance, loanOutstanding, cardCount, recentTransactions });
  } catch {
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

export default router;
