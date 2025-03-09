import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCompareCommits } from "../../api/store/actions/contribution_tracker/contribution.actions";
import MessageBox from "./MessageBox";
import { AreaChart, Card, Title } from "@tremor/react";

const CompareCommitChart = () => {
    const userId = "1";
    const dispatch = useDispatch();

    const compareCommits = useSelector((state) => state.compareCommits);
    const { loading, error, commits } = compareCommits;

    const debounceChartRef = useRef(null);

    useEffect(() => {
        clearTimeout(debounceChartRef.current);
        debounceChartRef.current = setTimeout(() => {
            dispatch(getCompareCommits(userId));
        }, 200);
    }, []);

    return (
        <>
            <div>
                {loading ? (
                    <p> Loading... </p>
                ) : error ? (
                    <MessageBox variant="danger">{error}</MessageBox>
                ) : (
                    <>
                        <Card className="mb-4">
                            <Title>Your commits in 2 weeks</Title>
                            <AreaChart
                                className="h-72 mt-4"
                                data={commits}
                                index="date"
                                categories={["Week Commit", "Previous Week Commit"]}
                                colors={["cyan", "indigo"]}
                            />
                        </Card>
                    </>
                )}

            </div>
        </>
    )
}

export default CompareCommitChart;
