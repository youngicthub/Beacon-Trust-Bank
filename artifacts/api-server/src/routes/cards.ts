import { Router, type IRouter, type Request, type Response } from "express";
import { db, cardsTable, accountsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

const router: IRouter = Router();

// GET /api/cards
router.get(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const cards = await db.query.cardsTable.findMany({
        where: eq(cardsTable.userId, req.user!.id),
      });
      res.json({ cards });
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// POST /api/cards
router.post(
  "/",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const { account_id, type, cardholder_name } = req.body as {
      account_id?: string;
      type?: "debit" | "virtual";
      cardholder_name?: string;
    };

    if (!account_id || !type || !cardholder_name) {
      res
        .status(400)
        .json({ error: "account_id, type, and cardholder_name are required" });
      return;
    }

    try {
      const account = await db.query.accountsTable.findFirst({
        where: and(
          eq(accountsTable.id, account_id),
          eq(accountsTable.userId, req.user!.id),
        ),
      });

      if (!account) {
        res.status(404).json({ error: "Account not found" });
        return;
      }

      const last4 = Math.floor(1000 + Math.random() * 9000).toString();
      const now = new Date();
      const expiryMonth = now.getMonth() + 1;
      const expiryYear = now.getFullYear() + 3;

      const [card] = await db
        .insert(cardsTable)
        .values({
          userId: req.user!.id,
          accountId: account_id,
          type,
          status: "pending",
          cardholderName: cardholder_name,
          last4,
          expiryMonth,
          expiryYear,
          network: type === "virtual" ? "Visa" : "Mastercard",
        })
        .returning();

      res.status(201).json({ card });
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// PATCH /api/cards/:id
router.patch(
  "/:id",
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    const { status } = req.body as {
      status?: "active" | "frozen" | "blocked" | "pending";
    };

    if (!status) {
      res.status(400).json({ error: "status is required" });
      return;
    }

    // Users can only freeze/unfreeze
    const userAllowedStatuses: Array<string> = ["active", "frozen"];
    if (!userAllowedStatuses.includes(status)) {
      res.status(403).json({ error: "Users can only set status to active or frozen" });
      return;
    }

    try {
      const card = await db.query.cardsTable.findFirst({
        where: and(
          eq(cardsTable.id, req.params["id"]!),
          eq(cardsTable.userId, req.user!.id),
        ),
      });

      if (!card) {
        res.status(404).json({ error: "Card not found" });
        return;
      }

      const [updated] = await db
        .update(cardsTable)
        .set({ status })
        .where(eq(cardsTable.id, card.id))
        .returning();

      res.json({ card: updated });
    } catch {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
