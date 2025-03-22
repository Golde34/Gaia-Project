import { Button } from "@tremor/react";
import { useState } from "react";

export const CreateScheduleTaskDialog = (props) => {
    const userId = props.userId;
    let defaultDuration = 2;
    let [isOpen, setIsOpen] = useState(false);
    function closeModql() {
        setIsOpen(false);
    }
    function openModal() {
        setIsOpen(true);
    }

    const [title, setTitle] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [deadline, setDeadline] = useState(new Date());
    const [duration, setDuration] = useState(0);
    // Priority check boxes
    const [isHighPriority, setIsHighPriority] = useState(false);
    const [isMediumPriority, setIsMediumPriority] = useState(false);
    const [isLowPriority, setIsLowPriority] = useState(false);
    const [isStarPriority, setIsStarPriority] = useState(false);
    const [repeat, setRepeat] = useState(0);
    const [isNotify, setIsNotify] = useState(false);

    return (
        <>
            <Button type='button' color='indigo' onClick={openModal}>
                Create new Schedule Task 
            </Button>
        </>
    )
}