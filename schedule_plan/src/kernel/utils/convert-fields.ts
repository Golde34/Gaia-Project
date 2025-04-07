import { ErrorStatus } from "../../core/domain/enums/enums";

export const convertPriority = (priorities: string[]): number => {
    const priority = priorities[0];
    switch (priority) {
        case "Low":
            return 1;
        case "Medium":
            return 2;
        case "High":
            return 3;
        case "Star":
            return 5;
        default:
            return 0;
    }
}

export const convertErrorCodeToBoolean = (error: string): boolean => {
    switch (error) {
        case ErrorStatus.SUCCESS:
            return true;
        case ErrorStatus.FAIL:
            return false;
        case ErrorStatus.TIMEOUT:
            return false;
        default:
            console.log('Error code not found: ', error);
            return false;
    }
}

export const revertPriority = (priority: number): string[] => {
    switch (priority) {
        case 1:
            return ["Low"];
        case 2:
            return ["Medium"];
        case 3:
            return ["High"];
        case 5:
            return ["Star"];
        case 6:
            return ["Low", "Star"];
        case 7:
            return ["Medium", "Star"];
        case 8:
            return ["High", "Star"];
        default:
            return ["Medium"]; 
    }
} 

const days = {
    "Sunday": 0,
    "Monday": 1,
    "Tuesday": 2,
    "Wednesday": 3,
    "Thursday": 4,
    "Friday": 5,
    "Saturday": 6
};

export const convertWeekday = (weekday: (keyof typeof days)[]): number[] => {
    return weekday.map(day => days[day]);
}
