import { Router, type IRouter } from "express";
import healthRouter from "./health";
import jobsRouter from "./jobs";
import candidatesRouter from "./candidates";
import applicationsRouter from "./applications";
import interviewsRouter from "./interviews";
import dashboardRouter from "./dashboard";
import boardRouter from "./board";

const router: IRouter = Router();

router.use(healthRouter);
router.use(boardRouter);
router.use(jobsRouter);
router.use(candidatesRouter);
router.use(applicationsRouter);
router.use(interviewsRouter);
router.use(dashboardRouter);

export default router;
