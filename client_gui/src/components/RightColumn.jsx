import Item from "../components/subComponents/Item";
import ScoreList from "../components/subComponents/ScoreList";
import CompareCommitChart from "./subComponents/CompareCommitsChart";

const RightColumn = () => {
	return (
		<div className="w-full p-2">
			<CompareCommitChart />
			<Item />
			<ScoreList />
		</div>
	);
};

export default RightColumn;