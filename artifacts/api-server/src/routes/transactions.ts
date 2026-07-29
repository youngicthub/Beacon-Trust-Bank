import { Router, type IRouter, type Request, type Response } from "express";
import {
  db,
  accountsTable,
  transactionsTable,
  beneficiariesTable,
} from "@workspace/db";
import { eq, and, desc, inArray, or, ilike, sql } from "drizzle-orm";
import { authenticate } from "../middleware/auth";
import { randomUUID } from "crypto";

const router: IRouter = Router();

// GET /api/transactions
router.get(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { account_id, limit = "20", offset = "0", search } = req.query as {
        account_id?: string;
        limit?: string;
        offset?: string;
        search?: string;
      };

      const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
      const offsetNum = parseInt(offset, 10) || 0;

      // Get user's accounts
      const userAccounts = await db
        .select({ id: accountsTable.id })
        .from(accountsTable)
        .where(eq(accountsTable.userId, req.user!.id));

      const accountIds = userAccounts.map((a) => a.id);

      if (accountIds.length === 0) {
        res.json({ transactions: [], total: 0 });
        return;
      }

      const filteredAccountIds =
        account_id && accountIds.includes(account_id)
          ? [account_id]
          : accountIds;

      let query = db
        .select()
        .from(transactionsTable)
        .where(inArray(transactionsTable.accountId, filteredAccountIds))
        .orderBy(desc(transactionsTable.createdAt))
        .limit(limitNum)
        .offset(offsetNum);

      const transactions = await query;
      res.json({ transactions });
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// POST /api/transactions/transfer
router.post(
  "/transfer",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const {
      from_account_id,
      transfer_type,
      to_account_number,
      beneficiary_id,
      recipient_name,
      recipient_bank,
      swift_code,
      amount,
      description,
    } = req.body as {
      from_account_id?: string;
      transfer_type?: string;
      to_account_number?: string;
      beneficiary_id?: string;
      recipient_name?: string;
      recipient_bank?: string;
      swift_code?: string;
      amount?: number;
      description?: string;
    };

    if (!from_account_id || !amount) {
      res.status(400).json({ error: "from_account_id and amount are required" });
      return;
    }

    try {
      const account = await db.query.accountsTable.findFirst({
        where: and(
          eq(accountsTable.id, from_account_id),
          eq(accountsTable.userId, req.user!.id),
        ),
      });

      if (!account) {
        res.status(404).json({ error: "Account not found" });
        return;
      }

      const balance = parseFloat(account.balance ?? "0");
      if (balance < amount) {
        res.status(400).json({ error: "Insufficient balance" });
        return;
      }

      let resolvedRecipientName = recipient_name ?? null;
      let resolvedRecipientAccount = to_account_number ?? null;

      if (beneficiary_id) {
        const beneficiary = await db.query.beneficiariesTable.findFirst({
          where: and(
            eq(beneficiariesTable.id, beneficiary_id),
            eq(beneficiariesTable.userId, req.user!.id),
          ),
        });
        if (beneficiary) {
          resolvedRecipientName = resolvedRecipientName ?? beneficiary.name;
          resolvedRecipientAccount =
            resolvedRecipientAccount ?? beneficiary.accountNumber;
        }
      }

      const [transaction] = await db
        .insert(transactionsTable)
        .values({
          accountId: from_account_id,
          type: "debit",
          amount: String(amount),
          status: "pending",
          description: description ?? null,
          recipientName: resolvedRecipientName,
          recipientAccount: resolvedRecipientAccount,
          reference: `TXN-${randomUUID().slice(0, 8).toUpperCase()}`,
          category: transfer_type ?? "transfer",
        })
        .returning();

      res.status(201).json({ transaction });
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
