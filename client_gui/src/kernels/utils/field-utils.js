import { BadgeDeltaType, ColorConstants, TaskPriority, TaskStatus } from "../constants/constants"

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
