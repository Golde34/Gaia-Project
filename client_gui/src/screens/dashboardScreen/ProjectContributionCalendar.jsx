import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProjectContribution } from "../../api/store/actions/contribution_tracker/contribution.actions";
import { Card } from "@tremor/react";
import MessageBox from "../../components/subComponents/MessageBox";
import AreaChartComponent from "../../components/subComponents/AreaChartComponent";

const ProjectContributionCalendar = (props) => {
    const userId = "1";
    const projectId = props.projectId;
    const dispatch = useDispatch();
    const projectContributionList = useSelector((state) => state.projectContributions);
    const { loading, error, contributions } = projectContributionList;

    const debounceRef = useRef(null);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            dispatch(getProjectContribution(userId, projectId));
        }, 200);
    }, [])

    return (
        <div className="flex-auto w-full">
            <Card className="mb-4">
                {
                    loading ? (
                        <div>Loading...</div>
                    ) : error ? (
                        <div><MessageBox message={error} /></div>
                    ) : (
                        <AreaChartComponent contributions={contributions} />
                    )
                }
            </Card>
        </div>
    );
};

export default ProjectContributionCalendar;