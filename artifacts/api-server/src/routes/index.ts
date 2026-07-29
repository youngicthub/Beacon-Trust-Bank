import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import accountsRouter from "./accounts";
import cardsRouter from "./cards";
import transactionsRouter from "./transactions";
import dashboardRouter from "./dashboard";
import adminRouter from "./admin";
import staffRouter from "./staff";
import beneficiariesRouter from "./beneficiaries";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/accounts", accountsRouter);
router.use("/cards", cardsRouter);
router.use("/transactions", transactionsRouter);
router.use("/dashboard", dashboardRouter);
router.use("/admin", adminRouter);
router.use("/staff", staffRouter);
router.use("/beneficiaries", beneficiariesRouter);

export default router;
