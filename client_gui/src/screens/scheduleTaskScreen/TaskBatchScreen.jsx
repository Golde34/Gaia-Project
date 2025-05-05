import { CheckCircleIcon } from "@heroicons/react/solid";
import { convertISODateToString } from "../../kernels/utils/date-picker";
import { priorityColor } from "../../kernels/utils/field-utils";
import { Badge, Col, Grid } from "@tremor/react";
import { useChooseTaskBatchDispatch } from '../../kernels/utils/write-dialog-api-requests';

const TaskBatchScreen = (props) => {
    const { taskBatchList } = props;
    const batchNumbers = Object.keys(taskBatchList);
    const batchCount = batchNumbers.length;

    if (batchCount === 0) {
        return <p>No task batch available</p>;
    }

    let justifyContentClass = '';
    if (batchCount === 1) {
        justifyContentClass = 'justify-center';
    } else if (batchCount === 2) {
        justifyContentClass = 'justify-evenly';
    } else if (batchCount === 3) {
        justifyContentClass = 'justify-between';
    }

    const chooseTaskBatch = useChooseTaskBatchDispatch();
    const setObjectTaskBatch = (batchNumber) => {
        chooseTaskBatch(batchNumber);
        window.location.reload();
    }

    return (
        <>
            <form>
                <h4 className="font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong mb-4">
                    Your task batch
                </h4>
                <div>
                    <p className="text-center text-gray-600 dark:text-gray-300 mt-2 mb-5 text-lg">
                        Select a batch to perform the tasks you love first!
                    </p>
                </div>

                <div key={"batchNumbers"} className={`flex ${justifyContentClass} gap-8`}>
                    {batchNumbers.map((batchNumber) => {
                        const tasks = taskBatchList[batchNumber] || [];
                        return (
                            <div key={ batchNumber } className="flex flex-col items-center gap-6 p-6 rounded-lg shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold text-gray-800 dark:text-white text-center">
                                    Batch {batchNumber}
                                </h2>
                                <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
                                    Select a batch to perform the tasks you love first!
                                </p>
                                <div className="w-full bg-gray-50 dark:bg-gray-900 p-6 rounded-md border border-gray-300 dark:border-gray-700 h-64 flex flex-col justify-between overflow-y-auto">
                                    <ul className="mt-4 space-y-3">
                                        {tasks.map((task, i) => (
                                            <li key={i} className="flex flex-col gap-2">
                                                <div className="flex items-center space-x-3">
                                                    <CheckCircleIcon
                                                        className="w-5 h-5 text-green-500 dark:text-green-400"
                                                        aria-hidden="true"
                                                    />
                                                    <span className="text-gray-700 dark:text-gray-200 text-sm font-medium truncate w-full">
                                                        {task.title}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                                                    <Grid numItems={1}>
                                                        <Col>
                                                            <span className="flex items-center space-x-2">
                                                                Priority:
                                                                {task.priority.map((priority, index) => (
                                                                    <Badge key={`${task.id}-${priority}-${index}`} className="ms-4 me-1 mt-1" color={priorityColor(priority)}>
                                                                        {priority}
                                                                    </Badge>
                                                                ))}
                                                            </span>
                                                        </Col>
                                                        <Col>
                                                            <span className='flex items-center space-x-2 mt-2'>
                                                                <p>Deadline: {convertISODateToString(task.deadline)}</p>
                                                            </span>
                                                        </Col>
                                                    </Grid>


                                                </div>
                                                <hr aria-hidden="true" className="my-2 border-t border-gray-300 dark:border-gray-700" />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button
                                    className="mt-4 px-6 py-2 bg-indigo-500 text-white rounded-md shadow-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
                                    onClick={() => setObjectTaskBatch(batchNumber)}
                                >
                                    Select This Batch
                                </button>
                            </div>
                        );
                    })}
                </div>
            </form>
        </>
    );
}

export default TaskBatchScreen;