import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, accountsTable, transactionsTable, loansTable, kycRecordsTable, supportTicketsTable, notificationsTable, cardsTable, investmentsTable, beneficiariesTable, auditLogsTable, passwordResetTokensTable } from "@workspace/db";
import { eq, or, ilike, inArray, gte, desc, sql, and, ne } from "drizzle-orm";
import { authenticate, requireRole } from "../middleware/auth";
import bcrypt from "bcryptjs";
import { format } from "date-fns";

const router: IRouter = Router();
router.use(authenticate);
router.use(requireRole(["admin", "staff"]));

// ─── Analytics / Dashboard ───────────────────────────────────────────────────

router.get("/analytics", async (_req: Request, res: Response): Promise<void> => {
  try {
    const since = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

    const [
      customers,
      activeAccounts,
      activeLoans,
      txCount,
      pendingKyc,
      openTickets,
      txTrend,
      recentSignups,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.role, "customer")),
      db.select({ count: sql<number>`count(*)::int`, totalBalance: sql<number>`coalesce(sum(balance::numeric),0)` }).from(accountsTable).where(eq(accountsTable.status, "active")),
      db.select({ amount: loansTable.amount }).from(loansTable).where(inArray(loansTable.status, ["active", "approved"])),
      db.select({ count: sql<number>`count(*)::int` }).from(transactionsTable),
      db.select({ count: sql<number>`count(*)::int` }).from(kycRecordsTable).where(eq(kycRecordsTable.status, "pending")),
      db.select({ count: sql<number>`count(*)::int` }).from(supportTicketsTable).where(eq(supportTicketsTable.status, "open")),
      db.select({ amount: transactionsTable.amount, type: transactionsTable.type, createdAt: transactionsTable.createdAt })
        .from(transactionsTable).where(gte(transactionsTable.createdAt, since)),
      db.select({
        id: usersTable.id, firstName: usersTable.firstName, lastName: usersTable.lastName,
        email: usersTable.email, createdAt: usersTable.createdAt,
      }).from(usersTable).orderBy(desc(usersTable.createdAt)).limit(6),
    ]);

    // Build recent signups with KYC
    const signupIds = recentSignups.map(u => u.id);
    const kycMap = new Map<string, string>();
    if (signupIds.length > 0) {
      const kycs = await db.select({ userId: kycRecordsTable.userId, status: kycRecordsTable.status })
        .from(kycRecordsTable).where(inArray(kycRecordsTable.userId, signupIds));
      kycs.forEach(k => { if (k.userId) kycMap.set(k.userId, k.status); });
    }

    // Build 6-month trends
    const buckets = new Map<string, { income: number; expenses: number }>();
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.set(format(d, "yyyy-MM"), { income: 0, expenses: 0 });
    }
    for (const t of txTrend) {
      if (!t.createdAt) continue;
      const key = format(new Date(t.createdAt), "yyyy-MM");
      const b = buckets.get(key);
      if (!b) continue;
      const amt = Number(t.amount ?? 0);
      if (t.type === "credit") b.income += amt; else b.expenses += amt;
    }
    const transactionTrends = Array.from(buckets.entries()).map(([k, v]) => ({
      month: format(new Date(k + "-01"), "MMM"),
      income: v.income,
      expenses: v.expenses,
    }));

    res.json({
      totalCustomers: customers[0]?.count ?? 0,
      totalDeposits: Number(activeAccounts[0]?.totalBalance ?? 0),
      totalLoans: activeLoans.reduce((s, l) => s + Number(l.amount ?? 0), 0),
      totalTransactions: txCount[0]?.count ?? 0,
      totalAccounts: activeAccounts[0]?.count ?? 0,
      pendingKyc: pendingKyc[0]?.count ?? 0,
      openTickets: openTickets[0]?.count ?? 0,
      transactionTrends,
      recentSignups: recentSignups.map(u => ({
        id: u.id, firstName: u.firstName ?? "", lastName: u.lastName ?? "",
        email: u.email, createdAt: u.createdAt, kycStatus: kycMap.get(u.id) ?? null,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to load analytics" });
  }
});

// ─── Users ───────────────────────────────────────────────────────────────────

router.get("/users", async (req: Request, res: Response): Promise<void> => {
  const q = String(req.query.q ?? "").trim();
  try {
    const rows = await db.select({
      id: usersTable.id, email: usersTable.email, firstName: usersTable.firstName,
      lastName: usersTable.lastName, role: usersTable.role, isActive: usersTable.isActive,
      createdAt: usersTable.createdAt,
    }).from(usersTable)
      .where(q
        ? or(ilike(usersTable.email, `%${q}%`), ilike(usersTable.firstName, `%${q}%`), ilike(usersTable.lastName, `%${q}%`))
        : undefined)
      .orderBy(desc(usersTable.createdAt));

    const ids = rows.map(u => u.id);
    const kycMap = new Map<string, string>();
    if (ids.length > 0) {
      const kycs = await db.select({ userId: kycRecordsTable.userId, status: kycRecordsTable.status })
        .from(kycRecordsTable).where(inArray(kycRecordsTable.userId, ids));
      kycs.forEach(k => { if (k.userId) kycMap.set(k.userId, k.status); });
    }

    res.json(rows.map(u => ({ ...u, kycStatus: kycMap.get(u.id) ?? null })));
  } catch {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/users/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const [accounts, kyc] = await Promise.all([
      db.select().from(accountsTable).where(eq(accountsTable.userId, id)).orderBy(desc(accountsTable.createdAt)),
      db.select().from(kycRecordsTable).where(eq(kycRecordsTable.userId, id)).then(r => r[0] ?? null),
    ]);

    const { passwordHash: _ph, pinHash: _pin, ...safeUser } = user;
    res.json({ user: safeUser, accounts, kyc });
  } catch {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.patch("/users/:id/status", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { isActive } = req.body as { isActive?: boolean };
  if (typeof isActive !== "boolean") { res.status(400).json({ error: "isActive required" }); return; }
  try {
    await db.update(usersTable).set({ isActive, updatedAt: new Date() }).where(eq(usersTable.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.delete("/users/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const accs = await db.select({ id: accountsTable.id }).from(accountsTable).where(eq(accountsTable.userId, id));
    const accIds = accs.map(a => a.id);
    if (accIds.length > 0) {
      await db.delete(transactionsTable).where(inArray(transactionsTable.accountId, accIds));
      await db.delete(cardsTable).where(inArray(cardsTable.accountId, accIds));
      await db.delete(accountsTable).where(inArray(accountsTable.id, accIds));
    }
    await db.delete(kycRecordsTable).where(eq(kycRecordsTable.userId, id));
    await db.delete(loansTable).where(eq(loansTable.userId, id));
    await db.delete(investmentsTable).where(eq(investmentsTable.userId, id));
    await db.delete(beneficiariesTable).where(eq(beneficiariesTable.userId, id));
    await db.delete(supportTicketsTable).where(eq(supportTicketsTable.userId, id));
    await db.delete(notificationsTable).where(eq(notificationsTable.userId, id));
    await db.delete(auditLogsTable).where(eq(auditLogsTable.userId, id));
    await db.delete(passwordResetTokensTable).where(eq(passwordResetTokensTable.userId, id));
    await db.delete(usersTable).where(eq(usersTable.id, id));
    res.json({ success: true });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message ?? "Delete failed" });
  }
});

router.post("/users/:id/fund", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { amount, note } = req.body as { amount?: number; note?: string };
  if (!amount || amount <= 0) { res.status(400).json({ error: "Valid amount required" }); return; }
  try {
    const [account] = await db.select().from(accountsTable)
      .where(and(eq(accountsTable.userId, id), eq(accountsTable.status, "active")))
      .limit(1);
    if (!account) { res.status(404).json({ error: "No active account found" }); return; }

    const newBalance = (Number(account.balance ?? 0) + amount).toFixed(2);
    await db.update(accountsTable).set({ balance: newBalance, updatedAt: new Date() }).where(eq(accountsTable.id, account.id));
    await db.insert(transactionsTable).values({
      accountId: account.id, type: "credit", amount: amount.toFixed(2),
      description: note || "Admin credit", status: "completed",
    });
    res.json({ success: true, newBalance: Number(newBalance) });
  } catch {
    res.status(500).json({ error: "Fund failed" });
  }
});

// ─── Accounts admin ──────────────────────────────────────────────────────────

router.get("/accounts", async (req: Request, res: Response): Promise<void> => {
  const { userId, status } = req.query as Record<string, string>;
  try {
    const conditions = [];
    if (userId) conditions.push(eq(accountsTable.userId, userId));
    if (status) conditions.push(eq(accountsTable.status, status as "active" | "frozen" | "closed" | "pending"));
    const rows = await db.select({
      id: accountsTable.id, userId: accountsTable.userId, accountNumber: accountsTable.accountNumber,
      type: accountsTable.type, status: accountsTable.status, balance: accountsTable.balance,
      currency: accountsTable.currency, createdAt: accountsTable.createdAt,
      email: usersTable.email, firstName: usersTable.firstName, lastName: usersTable.lastName,
    }).from(accountsTable)
      .leftJoin(usersTable, eq(accountsTable.userId, usersTable.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(accountsTable.createdAt));
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch accounts" });
  }
});

router.patch("/accounts/:id/status", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body as { status?: string };
  if (!status) { res.status(400).json({ error: "status required" }); return; }
  try {
    await db.update(accountsTable).set({ status: status as "active" | "frozen" | "closed" | "pending", updatedAt: new Date() }).where(eq(accountsTable.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update account" });
  }
});

// ─── KYC admin ───────────────────────────────────────────────────────────────

router.get("/kyc", async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select({
      id: kycRecordsTable.id, userId: kycRecordsTable.userId, fullName: kycRecordsTable.fullName,
      documentType: kycRecordsTable.documentType, documentNumber: kycRecordsTable.documentNumber,
      status: kycRecordsTable.status, adminNotes: kycRecordsTable.adminNotes,
      rejectionReason: kycRecordsTable.rejectionReason, createdAt: kycRecordsTable.createdAt,
      email: usersTable.email, firstName: usersTable.firstName, lastName: usersTable.lastName,
    }).from(kycRecordsTable)
      .leftJoin(usersTable, eq(kycRecordsTable.userId, usersTable.id))
      .orderBy(desc(kycRecordsTable.createdAt));
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch KYC records" });
  }
});

router.patch("/kyc/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, adminNotes, rejectionReason } = req.body as { status?: string; adminNotes?: string; rejectionReason?: string };
  try {
    await db.update(kycRecordsTable).set({
      status: status as "pending" | "verified" | "rejected",
      adminNotes: adminNotes ?? null,
      rejectionReason: rejectionReason ?? null,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(kycRecordsTable.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update KYC" });
  }
});

// ─── Loans admin ─────────────────────────────────────────────────────────────

router.get("/loans", async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select({
      id: loansTable.id, userId: loansTable.userId, type: loansTable.type,
      amount: loansTable.amount, interestRate: loansTable.interestRate, tenureMonths: loansTable.tenureMonths,
      emiAmount: loansTable.emiAmount, outstandingAmount: loansTable.outstandingAmount,
      purpose: loansTable.purpose, status: loansTable.status,
      approvedAt: loansTable.approvedAt, createdAt: loansTable.createdAt,
      email: usersTable.email, firstName: usersTable.firstName, lastName: usersTable.lastName,
    }).from(loansTable)
      .leftJoin(usersTable, eq(loansTable.userId, usersTable.id))
      .orderBy(desc(loansTable.createdAt));
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch loans" });
  }
});

router.patch("/loans/:id/status", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body as { status?: string };
  if (!status) { res.status(400).json({ error: "status required" }); return; }
  try {
    await db.update(loansTable).set({
      status: status as "pending" | "approved" | "active" | "rejected" | "closed",
      ...(status === "approved" ? { approvedAt: new Date() } : {}),
      updatedAt: new Date(),
    }).where(eq(loansTable.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update loan" });
  }
});

// ─── Transactions admin ───────────────────────────────────────────────────────

router.get("/transactions", async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.query as Record<string, string>;
  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  const offset = Number(req.query.offset ?? 0);
  try {
    let accountIds: string[] | undefined;
    if (userId) {
      const accs = await db.select({ id: accountsTable.id }).from(accountsTable).where(eq(accountsTable.userId, userId));
      accountIds = accs.map(a => a.id);
      if (accountIds.length === 0) { res.json([]); return; }
    }
    const rows = await db.select({
      id: transactionsTable.id, accountId: transactionsTable.accountId,
      type: transactionsTable.type, amount: transactionsTable.amount, status: transactionsTable.status,
      category: transactionsTable.category, description: transactionsTable.description,
      recipientName: transactionsTable.recipientName, recipientAccount: transactionsTable.recipientAccount,
      reference: transactionsTable.reference, createdAt: transactionsTable.createdAt,
      accountNumber: accountsTable.accountNumber, userId: accountsTable.userId,
      firstName: usersTable.firstName, lastName: usersTable.lastName,
    }).from(transactionsTable)
      .leftJoin(accountsTable, eq(transactionsTable.accountId, accountsTable.id))
      .leftJoin(usersTable, eq(accountsTable.userId, usersTable.id))
      .where(accountIds ? inArray(transactionsTable.accountId, accountIds) : undefined)
      .orderBy(desc(transactionsTable.createdAt))
      .limit(limit).offset(offset);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

router.patch("/transactions/:id/status", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body as { status?: string };
  if (!status) { res.status(400).json({ error: "status required" }); return; }
  try {
    await db.update(transactionsTable).set({ status: status as "completed" | "pending" | "failed" }).where(eq(transactionsTable.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update transaction" });
  }
});

// ─── Tickets admin ────────────────────────────────────────────────────────────

router.get("/tickets", async (_req: Request, res: Response): Promise<void> => {
  try {
    const rows = await db.select({
      id: supportTicketsTable.id, userId: supportTicketsTable.userId,
      subject: supportTicketsTable.subject, description: supportTicketsTable.description,
      priority: supportTicketsTable.priority, status: supportTicketsTable.status,
      staffNotes: supportTicketsTable.staffNotes,
      createdAt: supportTicketsTable.createdAt, updatedAt: supportTicketsTable.updatedAt,
      email: usersTable.email, firstName: usersTable.firstName, lastName: usersTable.lastName,
    }).from(supportTicketsTable)
      .leftJoin(usersTable, eq(supportTicketsTable.userId, usersTable.id))
      .orderBy(desc(supportTicketsTable.createdAt));
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

router.patch("/tickets/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, staffNotes } = req.body as { status?: string; staffNotes?: string };
  try {
    await db.update(supportTicketsTable).set({
      ...(status ? { status: status as "open" | "inProgress" | "resolved" | "closed" } : {}),
      ...(staffNotes !== undefined ? { staffNotes } : {}),
      updatedAt: new Date(),
    }).where(eq(supportTicketsTable.id, id));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to update ticket" });
  }
});

// ─── Audit Logs ───────────────────────────────────────────────────────────────

router.get("/audit-logs", async (req: Request, res: Response): Promise<void> => {
  const limit = Math.min(Number(req.query.limit ?? 50), 200);
  const offset = Number(req.query.offset ?? 0);
  try {
    const rows = await db.select({
      id: auditLogsTable.id, userId: auditLogsTable.userId, action: auditLogsTable.action,
      entityType: auditLogsTable.entityType, entityId: auditLogsTable.entityId,
      ipAddress: auditLogsTable.ipAddress, metadata: auditLogsTable.metadata,
      createdAt: auditLogsTable.createdAt,
      email: usersTable.email, firstName: usersTable.firstName, lastName: usersTable.lastName,
    }).from(auditLogsTable)
      .leftJoin(usersTable, eq(auditLogsTable.userId, usersTable.id))
      .orderBy(desc(auditLogsTable.createdAt))
      .limit(limit).offset(offset);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

// ─── Create customer account (admin) ─────────────────────────────────────────

router.post("/create-customer", async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, password, phone, accountType, role } = req.body as {
    firstName?: string; lastName?: string; email?: string; password?: string;
    phone?: string; accountType?: string; role?: string;
  };
  if (!email || !password) { res.status(400).json({ error: "email and password required" }); return; }
  try {
    const existing = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.email, email.toLowerCase()));
    if (existing.length) { res.status(409).json({ error: "Email already in use" }); return; }

    const passwordHash = await bcrypt.hash(password, 12);
    const allowedRoles = ["customer", "staff", "admin"];
    const userRole = allowedRoles.includes(role ?? "") ? (role as "customer" | "staff" | "admin") : "customer";
    const [user] = await db.insert(usersTable).values({
      email: email.toLowerCase(), firstName: firstName ?? null, lastName: lastName ?? null,
      phone: phone ?? null, passwordHash, role: userRole, isActive: true,
    }).returning();

    // Create bank account
    const accountNumber = `BT${Date.now()}${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
    const [account] = await db.insert(accountsTable).values({
      userId: user.id,
      accountNumber,
      type: (accountType ?? "savings") as "savings" | "current" | "business" | "investment",
      status: "active",
      balance: "0",
      currency: "USD",
    }).returning();

    res.status(201).json({ user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName }, account });
  } catch (err: unknown) {
    res.status(500).json({ error: (err as Error).message ?? "Failed to create customer" });
  }
});

export default router;
