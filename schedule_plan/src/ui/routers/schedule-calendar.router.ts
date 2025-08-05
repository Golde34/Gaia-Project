import { NextFunction, Request, Response, Router } from "express";
import { scheduleCalendarController } from "../controllers/schedule-calendar.controller";
import { returnResult } from "../../kernel/utils/return-result";

export const scheduleCalendarRouter = Router();

const scheduleCalendarControllerImpl = scheduleCalendarController;

scheduleCalendarRouter.post("/register",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const scheduleCalendarResult = await scheduleCalendarControllerImpl.registerScheduleCalendar(req, next);
            return returnResult(scheduleCalendarResult, "FAIL", res, next);
        } catch (error) {
            next(error);
        }
    }
)

scheduleCalendarRouter.get("/daily-calendar/:userId",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const scheduleCalendarResult = await scheduleCalendarControllerImpl.getDailyCalendar(req, next);
            return returnResult(scheduleCalendarResult, "FAIL", res, next);
        } catch (error) {
            next(error);
        }
    }
)

scheduleCalendarRouter.post("/daily-calendar",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const scheduleCalendarResult = await scheduleCalendarControllerImpl.createDailyCalendar(req, next);
            return returnResult(scheduleCalendarResult, "FAIL", res, next);
        } catch (error) {
            next(error);
        }
    }
)

scheduleCalendarRouter.post("/daily-calendar/start",
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            const scheduleCalendarResult = await scheduleCalendarControllerImpl.startDailyCalendar(req, next);
            return returnResult(scheduleCalendarResult, "FAIL", res, next);
        } catch (error) {
            next(error);
        }
    }
)