import { Router, type IRouter, type Request, type Response } from "express";
import { db, kycRecordsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate } from "../middleware/auth";

const router: IRouter = Router();
router.use(authenticate);

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const record = await db.query.kycRecordsTable.findFirst({
      where: eq(kycRecordsTable.userId, req.user!.id),
    });
    res.json(record ?? null);
  } catch {
    res.status(500).json({ error: "Failed to fetch KYC record" });
  }
});

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const {
    fullName, dateOfBirth, nationality, address,
    documentType, documentNumber, documentFrontImage, documentBackImage,
  } = req.body as Record<string, string>;

  if (!fullName || !documentType || !documentNumber || !documentFrontImage) {
    res.status(400).json({ error: "fullName, documentType, documentNumber and documentFrontImage are required" });
    return;
  }
  try {
    // Delete previous rejected record if any
    await db.delete(kycRecordsTable).where(eq(kycRecordsTable.userId, req.user!.id));

    const [record] = await db
      .insert(kycRecordsTable)
      .values({
        userId: req.user!.id,
        fullName,
        dateOfBirth: dateOfBirth ?? null,
        nationality: nationality ?? null,
        address: address ?? null,
        documentType: documentType as "passport" | "nationalId" | "driverLicense",
        documentNumber,
        documentFrontImage,
        documentBackImage: documentBackImage ?? null,
        status: "pending",
      })
      .returning();
    res.status(201).json(record);
  } catch {
    res.status(500).json({ error: "Failed to submit KYC" });
  }
});

export default router;
