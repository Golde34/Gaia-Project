import CardItem from "../../components/subComponents/CardItem"
import AreaChartComponent from "../../components/subComponents/AreaChartComponent"
import TableComponent from "../../components/subComponents/TableComponent"
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef } from "react";
import { getTopTasks } from "../../api/store/actions/task_manager/task.actions";
import MessageBox from "../../components/subComponents/MessageBox";
import { Card, Grid } from "@tremor/react";
import { getUserContributions } from "../../api/store/actions/contribution_tracker/contribution.actions";
import TopTask from "./TopTaskComponent";

const LeftColumn = () => {
    const userContributionList = useSelector((state) => state.userContributions);
    const { ctLoading, ctError, contributions } = userContributionList;

    const debounceRef = useRef(null);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            dispatch(getUserContributions(userId));
        }, 200);
    }, [])

    return (
        <div className="w-full flex flex-col justify-between p-2">
            <div className="flex flex-col lg:flex-rpw gap-2 w-full">
                <TopTask /> 
            </div>
            <div className="flex-auto w-full">
                
                <TableComponent />
            </div>
        </div>
    );
};

export default LeftColumn;