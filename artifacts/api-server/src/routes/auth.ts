import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import {
  db,
  usersTable,
  accountsTable,
  passwordResetTokensTable,
  type User,
} from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { signToken } from "../lib/jwt";
import { authenticate } from "../middleware/auth";
import {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from "../lib/mailer";

const router: IRouter = Router();

function toAuthUser(user: User) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    isActive: user.isActive,
  };
}

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { identifier, password } = req.body as {
    identifier?: string;
    password?: string;
  };

  if (!identifier || !password) {
    res.status(400).json({ error: "identifier and password are required" });
    return;
  }

  try {
    let user: User | undefined;

    if (identifier.includes("@")) {
      // Login by email
      user = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, identifier.toLowerCase()),
      });
    } else {
      // Login by account number
      const account = await db.query.accountsTable.findFirst({
        where: eq(accountsTable.accountNumber, identifier),
      });
      if (account) {
        user = await db.query.usersTable.findFirst({
          where: eq(usersTable.id, account.userId),
        });
      }
    }

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: "Account is deactivated" });
      return;
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role ?? "customer",
    });

    res.json({ token, user: toAuthUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/admin-register
router.post("/admin-register", async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, phone, password, adminToken } = req.body as {
    firstName?: string; lastName?: string; email?: string; phone?: string;
    password?: string; adminToken?: string;
  };

  const code = process.env.ADMIN_REGISTRATION_CODE ?? "BEACON-ADMIN-2024";
  if (!adminToken || adminToken !== code) {
    res.status(403).json({ error: "Invalid access code" });
    return;
  }

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  try {
    const existing = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, email.toLowerCase()),
    });
    if (existing) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(usersTable).values({
      email: email.toLowerCase(),
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      phone: phone ?? null,
      passwordHash,
      role: "admin",
      isActive: true,
    }).returning();

    if (!user) { res.status(500).json({ error: "Failed to create admin user" }); return; }

    const token = signToken({ sub: user.id, email: user.email, role: "admin" });
    res.status(201).json({ token, user: toAuthUser(user) });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/register
router.post(
  "/register",
  async (req: Request, res: Response): Promise<void> => {
    const { firstName, lastName, email, password, phone } = req.body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      phone?: string;
    };

    if (!email || !password) {
      res.status(400).json({ error: "email and password are required" });
      return;
    }

    try {
      const existing = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, email.toLowerCase()),
      });
      if (existing) {
        res.status(409).json({ error: "Email already in use" });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const [user] = await db
        .insert(usersTable)
        .values({
          email: email.toLowerCase(),
          firstName: firstName ?? null,
          lastName: lastName ?? null,
          phone: phone ?? null,
          passwordHash,
          role: "customer",
          isActive: true,
        })
        .returning();

      if (!user) {
        res.status(500).json({ error: "Failed to create user" });
        return;
      }

      const token = signToken({
        sub: user.id,
        email: user.email,
        role: user.role ?? "customer",
      });

      // Fire and forget welcome email
      sendWelcomeEmail(user.email, user.firstName ?? "there").catch(() => {});

      res.status(201).json({ token, user: toAuthUser(user) });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// GET /api/auth/me
router.get(
  "/me",
  authenticate,
  (req: Request, res: Response): void => {
    res.json(toAuthUser(req.user!));
  },
);

// POST /api/auth/logout
router.post(
  "/logout",
  authenticate,
  (_req: Request, res: Response): void => {
    res.json({ success: true });
  },
);

// POST /api/auth/forgot-password
router.post(
  "/forgot-password",
  async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body as { email?: string };
    // Always return success to avoid leaking whether email exists
    res.json({ success: true });

    if (!email) return;

    try {
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, email.toLowerCase()),
      });
      if (!user) return;

      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.insert(passwordResetTokensTable).values({
        userId: user.id,
        token,
        expiresAt,
        used: false,
      });

      const appUrl = process.env.APP_URL ?? "http://localhost:5173";
      const resetUrl = `${appUrl}/reset-password?token=${token}`;

      sendPasswordResetEmail(user.email, resetUrl).catch(() => {});
    } catch {
      // Silently ignore errors
    }
  },
);

// POST /api/auth/reset-password
router.post(
  "/reset-password",
  async (req: Request, res: Response): Promise<void> => {
    const { token, password } = req.body as {
      token?: string;
      password?: string;
    };

    if (!token || !password) {
      res.status(400).json({ error: "token and password are required" });
      return;
    }

    try {
      const resetToken = await db.query.passwordResetTokensTable.findFirst({
        where: eq(passwordResetTokensTable.token, token),
      });

      if (!resetToken) {
        res.status(400).json({ error: "Invalid token" });
        return;
      }

      if (resetToken.used) {
        res.status(400).json({ error: "Token already used" });
        return;
      }

      if (new Date() > new Date(resetToken.expiresAt)) {
        res.status(400).json({ error: "Token expired" });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 12);

      await db
        .update(usersTable)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(usersTable.id, resetToken.userId!));

      await db
        .update(passwordResetTokensTable)
        .set({ used: true })
        .where(eq(passwordResetTokensTable.id, resetToken.id));

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

export default router;
