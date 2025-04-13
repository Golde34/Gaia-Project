import { TimeUnit } from "../../core/domain/enums/enums";

export const buildCommonStringValue = (value: string): string => {
    // HIGH, HiGh, high, hiGH, hIgh -> High
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export const isStringEmpty = (value: string | undefined): boolean => {
    return value === null || value === undefined || value.trim() === '';
}

export const calculdateDaysBetweenDates = (currentDate: Date, timeUnit: string): Date => {
        const timeUnitMap: { [key: string]: number } = {
            "seconds": 1000,
            "minutes": 60 * 1000,
            "hours": 60 * 60 * 1000,
            "days": 24 * 60 * 60 * 1000,
            "weeks": 7 * 24 * 60 * 60 * 1000,
            "months": 30 * 24 * 60 * 60 * 1000,
            "years": 365 * 24 * 60 * 60 * 1000
        };
        return new Date(currentDate.getTime() - (timeUnitMap[timeUnit] || timeUnitMap.day));
    }
