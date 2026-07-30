import { Router, type IRouter, type Request, type Response } from "express";
import { db, usersTable, accountsTable, transactionsTable, supportTicketsTable, kycRecordsTable } from "@workspace/db";
import { eq, or, ilike, inArray, desc, sql, and } from "drizzle-orm";
import { authenticate, requireRole } from "../middleware/auth";

const router: IRouter = Router();
router.use(authenticate);
router.use(requireRole("admin", "staff"));

// Search users
router.get("/users/search", async (req: Request, res: Response): Promise<void> => {
  const q = String(req.query.q ?? "").trim();
  const limit = Math.min(Number(req.query.limit ?? 10), 50);
  try {
    const rows = await db.select({
      id: usersTable.id, email: usersTable.email, firstName: usersTable.firstName,
      lastName: usersTable.lastName, role: usersTable.role, isActive: usersTable.isActive,
    }).from(usersTable)
      .where(q
        ? or(ilike(usersTable.email, `%${q}%`), ilike(usersTable.firstName, `%${q}%`), ilike(usersTable.lastName, `%${q}%`))
        : undefined)
      .limit(limit);
    res.json(rows);
  } catch {
    res.status(500).json({ error: "Search failed" });
  }
});

// Get single customer for staff
router.get("/users/:id", async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const [user] = await db.select({
      id: usersTable.id, email: usersTable.email, firstName: usersTable.firstName,
      lastName: usersTable.lastName, role: usersTable.role, phone: usersTable.phone,
      address: usersTable.address, isActive: usersTable.isActive, createdAt: usersTable.createdAt,
    }).from(usersTable).where(eq(usersTable.id, id));
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const [accounts, kyc, tickets] = await Promise.all([
      db.select().from(accountsTable).where(eq(accountsTable.userId, id)).orderBy(desc(accountsTable.createdAt)),
      db.select().from(kycRecordsTable).where(eq(kycRecordsTable.userId, id)).then(r => r[0] ?? null),
      db.select().from(supportTicketsTable).where(eq(supportTicketsTable.userId, id)).orderBy(desc(supportTicketsTable.createdAt)),
    ]);

    res.json({ user, accounts, kyc, tickets });
  } catch {
    res.status(500).json({ error: "Failed to fetch customer" });
  }
});

// Tickets for staff
router.get("/tickets", async (req: Request, res: Response): Promise<void> => {
  const { status } = req.query as Record<string, string>;
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
      .where(status ? eq(supportTicketsTable.status, status as "open" | "inProgress" | "resolved" | "closed") : undefined)
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

export default router;
