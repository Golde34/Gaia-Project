export class TaskStatus {
    static TODO = "TODO";
    static IN_PROGRESS = "IN_PROGRESS";
    static DONE = "DONE";
    static PENDING = "PENDING";
}

export class TaskPriority {
    static LOW = "low";
    static MEDIUM = "medium";
    static HIGH = "high";
    static STAR = "star";
    static LOW_CAMEL = "Low";
    static MEDIUM_CAMEL = "Medium";
    static HIGH_CAMEL = "High";
    static STAR_CAMEL = "Star";
}

export class BadgeDeltaType {
    static MODERATE_DECREASE = "moderateDecrease";
    static UNCHANGED = "unchanged";
    static INCREASE = "increase";
    static DECREASE = "decrease";
}

export class ColorConstants {
    static RED = "red";
    static GREEN = "green";
    static BLUE = "blue";
    static YELLOW = "yellow";
    static INDIGO = "indigo";
    static PINK = "pink";
}

export class Weekday {
    static SUNDAY = "Sunday";
    static MONDAY = "Monday";
    static TUESDAY = "Tuesday";
    static WEDNESDAY = "Wednesday";
    static THURSDAY = "Thursday";
    static FRIDAY = "Friday";
    static SATURDAY = "Saturday";
}

export class ServiceTag {
    static SCHEDULE_GROUP = "ScheduleGroup";
    static GROUP_TASK = "Group Task";
    static NOTE = "Note";
    static PROJECT = "Project";
}