import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import teachersRouter from "./teachers";
import coursesRouter from "./courses";
import lessonsRouter from "./lessons";
import assignmentsRouter from "./assignments";
import communicationsRouter from "./communications";
import paymentsRouter from "./payments";
import feedRouter from "./feed";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(teachersRouter);
router.use(coursesRouter);
router.use(lessonsRouter);
router.use(assignmentsRouter);
router.use(communicationsRouter);
router.use(paymentsRouter);
router.use(feedRouter);
router.use(analyticsRouter);

export default router;
