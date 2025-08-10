import { Router } from "express";
import { scheduleGroupController } from "../controllers/schedule-group.controller";

export const scheduleDayRouter = Router();

const scheduleDayControllerImpl = scheduleGroupController; 