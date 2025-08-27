import { BadgeDeltaType, ColorConstants, TaskPriority, TaskStatus, Weekday } from "../constants/constants"

export const statusColor = (status) => {
    if (status === TaskStatus.TODO) {
        return BadgeDeltaType.MODERATE_DECREASE
    } else if (status === TaskStatus.IN_PROGRESS) {
        return BadgeDeltaType.UNCHANGED
    } else if (status === TaskStatus.DONE) {
        return BadgeDeltaType.INCREASE
    } else if (status === TaskStatus.PENDING) {
        return BadgeDeltaType.DECREASE
    }
}

export const priorityColor = (priority) => {
    if (priority.toLowerCase() === TaskPriority.LOW) {
        return ColorConstants.GREEN
    } else if (priority.toLowerCase() === TaskPriority.MEDIUM) {
        return ColorConstants.BLUE
    } else if (priority.toLowerCase() === TaskPriority.HIGH) {
        return ColorConstants.RED
    } else if (priority.toLowerCase() === TaskPriority.STAR) {
        return ColorConstants.YELLOW
    }
}

export const pushPriority = (isHighPriority, isMediumPriority, isLowPriority, isStarPriority) => {
    let priority = []
    if (isHighPriority) {
        priority.push(TaskPriority.HIGH_CAMEL)
    }
    if (isMediumPriority) {
        priority.push(TaskPriority.MEDIUM_CAMEL)
    }
    if (isLowPriority) {
        priority.push(TaskPriority.LOW_CAMEL)
    }
    if (isStarPriority) {
        priority.push(TaskPriority.STAR_CAMEL)
    }
    return priority
}

export const pullPriority = (priorities) => {
    let isHighPriority = false
    let isMediumPriority = false
    let isLowPriority = false
    let isStarPriority = false
    if (priorities === undefined || priorities === null) {
        return [isHighPriority, isMediumPriority, isLowPriority, isStarPriority]
    }
    for (let priority of priorities) {
        if (priority.toLowerCase() === TaskPriority.HIGH) {
            isHighPriority = true
        } else if (priority.toLowerCase() === TaskPriority.MEDIUM) {
            isMediumPriority = true
        } else if (priority.toLowerCase() === TaskPriority.LOW) {
            isLowPriority = true
        } else if (priority.toLowerCase() === TaskPriority.STAR) {
            isStarPriority = true
        }
    }
    return [isHighPriority, isMediumPriority, isLowPriority, isStarPriority]
}

export const pushRepeat = (isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, isSunday) => {
    let repeat = []
    if (isMonday) {
        repeat.push(Weekday.MONDAY)
    }
    if (isTuesday) {
        repeat.push(Weekday.TUESDAY)
    }
    if (isWednesday) {
        repeat.push(Weekday.WEDNESDAY)
    }
    if (isThursday) {
        repeat.push(Weekday.THURSDAY)
    }
    if (isFriday) {
        repeat.push(Weekday.FRIDAY)
    }
    if (isSaturday) {
        repeat.push(Weekday.SATURDAY)
    }
    if (isSunday) {
        repeat.push(Weekday.SUNDAY)
    }
    return repeat
}

export const pullRepeat = (repeats) => {
    let isMonday = false
    let isTuesday = false
    let isWednesday = false
    let isThursday = false
    let isFriday = false
    let isSaturday = false
    let isSunday = false
    if (repeats === undefined || repeats === null) {
        return [isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, isSunday]
    }
    for (let repeat of repeats) {
        if (repeat === Weekday.MONDAY) {
            isMonday = true
        } else if (repeat === Weekday.TUESDAY) {
            isTuesday = true
        } else if (repeat === Weekday.WEDNESDAY) {
            isWednesday = true
        } else if (repeat === Weekday.THURSDAY) {
            isThursday = true
        } else if (repeat === Weekday.FRIDAY) {
            isFriday = true
        } else if (repeat === Weekday.SATURDAY) {
            isSaturday = true
        } else if (repeat === Weekday.SUNDAY) {
            isSunday = true
        }
    }
    return [isMonday, isTuesday, isWednesday, isThursday, isFriday, isSaturday, isSunday]
}

export const shortenTitle = (title, maxLength = 20, condition = 25) => {
    if (title.length > condition) {
        return title.substring(0, maxLength) + "...";
    }
    return title;
}