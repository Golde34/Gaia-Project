import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getTopTasks } from "../../api/store/actions/task_manager/task.actions";
import MessageBox from "../../components/subComponents/MessageBox";
import { Grid } from "@tremor/react";
import CardItem from "../../components/subComponents/CardItem";

const TopTask = () => {
    const dispatch = useDispatch();

    const taskList = useSelector((state) => state.topTask);
    const { loading, error, topTasks } = taskList;
    const didGetTopTaskRef = useRef();

    useEffect(() => {
        if (didGetTopTaskRef.current) return;
        dispatch(getTopTasks());
        didGetTopTaskRef.current = true;
    }, [dispatch]);

    return (
        <div className="w-full flex flex-col justify-between p-2">
            <div className="flex flex-col lg:flex-rpw gap-2 w-full">
                {
                    loading ? (
                        <div>Loading...</div>
                    ) : error ? (
                        <div><MessageBox message={error} /></div>
                    ) : (
                        topTasks === null || topTasks === undefined || topTasks.length === 0 ? (
                            // <div><MessageBox message="No tasks found"/></div>
                            <div></div>
                        ) :
                            <Grid numItems={3}>
                                {topTasks.map((topTask) => (
                                    <CardItem key={topTask.task._id} task={topTask.task}
                                        groupTaskId={topTask.groupTaskId} projectId={topTask.projectId}
                                        taskId={topTask.task._id} navigateWord={"project"} />
                                ))}
                            </Grid>
                    )
                }
            </div>
        </div>
    );
}

export default TopTask;