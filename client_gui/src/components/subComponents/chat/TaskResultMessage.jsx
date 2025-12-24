import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon } from "@heroicons/react/outline";
import { Card } from "@tremor/react";

export default function TaskResultMessage({ taskData }) {
    if (!taskData) return null;

    const {
        title,
        status,
        priority,
        deadline,
        startDate,
        duration,
        taskId,
        actionType,
        response: taskResponse
    } = taskData;

    const getStatusIcon = (status) => {
        switch (status?.toUpperCase()) {
            case 'TODO':
                return <ClockIcon className="w-5 h-5 text-blue-500" />;
            case 'DONE':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'IN_PROGRESS':
                return <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />;
            default:
                return <ClockIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'medium':
                return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            case 'low':
                return 'text-green-600 bg-green-50 border-green-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    return (
        <Card className="mt-2 border-l-4 border-l-blue-500 bg-blue-50/50">
            <div className="space-y-3">
                {/* Task Header */}
                <div className="flex items-start gap-3">
                    {getStatusIcon(status)}
                    <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{title}</h4>
                        {taskResponse && (
                            <p className="text-sm text-gray-600 mt-1">{taskResponse}</p>
                        )}
                    </div>
                    {priority && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-md border ${getPriorityColor(priority)}`}>
                            {priority}
                        </span>
                    )}
                </div>

                {/* Task Details */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                    {status && (
                        <div>
                            <span className="text-gray-500">Status:</span>
                            <span className="ml-2 font-medium">{status}</span>
                        </div>
                    )}
                    {actionType && (
                        <div>
                            <span className="text-gray-500">Action:</span>
                            <span className="ml-2 font-medium capitalize">{actionType}</span>
                        </div>
                    )}
                    {startDate && (
                        <div>
                            <span className="text-gray-500">Start:</span>
                            <span className="ml-2 font-medium">
                                {new Date(startDate).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                    {deadline && (
                        <div>
                            <span className="text-gray-500">Deadline:</span>
                            <span className="ml-2 font-medium">
                                {new Date(deadline).toLocaleDateString()}
                            </span>
                        </div>
                    )}
                    {duration && (
                        <div>
                            <span className="text-gray-500">Duration:</span>
                            <span className="ml-2 font-medium">{duration}</span>
                        </div>
                    )}
                    {taskId && (
                        <div className="col-span-2">
                            <span className="text-gray-500">ID:</span>
                            <span className="ml-2 font-mono text-xs text-gray-600">{taskId}</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
