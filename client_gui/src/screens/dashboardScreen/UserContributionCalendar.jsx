import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserContributions } from "../../api/store/actions/contribution_tracker/contribution.actions";
import { Card } from "@tremor/react";
import MessageBox from "../../components/subComponents/MessageBox";
import AreaChartComponent from "../../components/subComponents/AreaChartComponent";

const UserContributionCalendar = () => {
    const dispatch = useDispatch();
    const userContributionList = useSelector((state) => state.userContributions);
    const { loading, error, contributions } = userContributionList;

    const debounceRef = useRef(null);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            dispatch(getUserContributions());
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

export default UserContributionCalendar;