import CardItem from "../components/subComponents/CardItem"
import AreaChartComponent from "../components/subComponents/AreaChartComponent"
import TableComponent from "../components/subComponents/TableComponent"
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { getTopTasks } from "../api/store/actions/task_manager/task.actions";
import MessageBox from "./subComponents/MessageBox";
import { Grid } from "@tremor/react";

const LeftColumn = () => {
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
                        <div><MessageBox message={error}/></div>
                    ) : (
                        topTasks.length === 0 ? (
                            <div><MessageBox message="No tasks found"/></div>
                        ) :
                        <Grid numItems={3}>
                        {topTasks.map((topTask) => (
                            <CardItem key={topTask.task._id} task={topTask.task} 
                                groupTaskId={topTask.groupTaskId} projectId={topTask.projectId} />
                        ))}
                        </Grid>
                    )
                }
            </div>
            <div className="flex-auto w-full">
                <AreaChartComponent />
                <TableComponent />
            </div>
        </div>
    );
};

export default LeftColumn;