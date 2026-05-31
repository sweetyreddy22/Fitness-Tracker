import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import activitiesRouter from "./activities";
import workoutsRouter from "./workouts";
import goalsRouter from "./goals";
import waterRouter from "./water";
import reportsRouter from "./reports";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(activitiesRouter);
router.use(workoutsRouter);
router.use(goalsRouter);
router.use(waterRouter);
router.use(reportsRouter);

export default router;
