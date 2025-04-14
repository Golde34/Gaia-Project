import DoneTasksComponent from "../components/DoneTasksComponent";
import CompareCommitChart from "../components/subComponents/CompareCommitsChart";

const RightColumn = () => {
	return (
		<div className="w-full p-2">
			<CompareCommitChart />
			<DoneTasksComponent />
		</div>
	);
};

export default RightColumn;