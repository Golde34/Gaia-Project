import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "../../kernels/context/WebSocketContext";
import { optimizeTaskByUserId } from "../../api/store/actions/work_optimization/optimize-task.actions";
import { Text } from "@tremor/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";
import { generateDate, months } from "../../kernels/utils/calendar";
import ListCenterButton from "../../components/subComponents/ListCenterButton";
import cn from "../../kernels/utils/cn";

const CalendarChart = (props) => {
    const userId = "1";
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const days = ["S", "M", "T", "W", "T", "F", "S"];
    const [today, setToday] = useState(props.currentDate);
    const [selectDate, setSelectDate] = useState(props.selectDate);

    const { sendMessage, messages, isConnected } = useWebSocket();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const checkEmptyTaskList = props.checkEmptyScheduleTaskList;

    useEffect(() => {
        const handleMessage = (message) => {
            const data = JSON.parse(message);
            if (data.type === 'task_optimized' && data.userId === userId) {
                setIsLoading(false);
                setResult('success');
                checkEmptyTaskList();
            } else if (data.type === 'task_failed' && data.userId === userId) {
                setIsLoading(false);
                setResult('failed');
            }
        };

        messages.forEach(handleMessage);
    }, [messages, userId]);

    const handleOptimizeClick = (userId) => {
        setIsLoading(true);
        setResult(null);
        dispatch(optimizeTaskByUserId(userId))
        sendMessage(JSON.stringify({ type: 'optimize_task', userId }));
    };

    const listCenterButton = [
        { name: 'Add Event', color: 'rose' },
        { name: 'Optimize task list', color: 'green', onClick: () => handleOptimizeClick(userId) },
        { name: 'Full calendar', color: 'indigo', onClick: () => navigate('/calendar') },
    ]

    return (
        <>
            <div>
                {isLoading ? (
                    <Text>Loading... Optimizing tasks, please wait.</Text>
                ) : (
                    <p>
                        {result === 'success' && <Text>Optimize tasks successfully</Text>}
                        {result === 'failed' && <Text>Optimize tasks failed</Text>}
                        {!result && <Text>Optimize tasks</Text>}
                    </p>
                )}
            </div>
            <div className="w-full sm:px-5">
                <div className="flex justify-between items-center">
                    <h1 className="select-none font-semibold text-white">
                        {months[today.month()]}, {today.year()}
                    </h1>
                    <div className="flex gap-10 items-center ">
                        <ChevronLeftIcon
                            className="w-5 h-5 cursor-pointer hover:scale-105 transition-all"
                            color='indigo'
                            onClick={() => {
                                setToday(today.month(today.month() - 1));
                            }}
                        />
                        <h1
                            className=" cursor-pointer hover:scale-105 transition-all text-white"
                            onClick={() => {
                                setToday(currentDate);
                            }}
                        >
                            Today
                        </h1>
                        <ChevronRightIcon
                            className="w-5 h-5 cursor-pointer hover:scale-105 transition-all"
                            color='indigo'
                            onClick={() => {
                                setToday(today.month(today.month() + 1));
                            }}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-7 mt-5">
                    {days.map((day, index) => {
                        return (
                            <h1
                                key={index}
                                className="text-center h-14 grid place-content-center text-white select-none"
                            >
                                {day}
                            </h1>
                        );
                    })}
                </div>

                <div className=" grid grid-cols-7 ">
                    {generateDate(today.month(), today.year()).map(
                        ({ date, currentMonth, today }, index) => {
                            return (
                                <div
                                    key={index}
                                    className="p-2 text-center h-14 grid place-content-center border-t text-indigo-600">
                                    <h1
                                        className={cn(
                                            currentMonth ? "" : "text-gray-400",
                                            today
                                                ? "bg-red-600 text-white"
                                                : "",
                                            selectDate
                                                .toDate()
                                                .toDateString() ===
                                                date.toDate().toDateString()
                                                ? "bg-black text-white"
                                                : "",
                                            "h-10 w-10 rounded-full grid place-content-center hover:bg-black hover:text-indigo transition-all cursor-pointer select-none"
                                        )}
                                        onClick={() => {
                                            setSelectDate(date);
                                        }}>
                                        {date.date()}
                                    </h1>
                                </div>
                            );
                        }
                    )}
                </div>

                <ListCenterButton listNameButton={listCenterButton} />
            </div>
        </>
    )
}

export default CalendarChart;