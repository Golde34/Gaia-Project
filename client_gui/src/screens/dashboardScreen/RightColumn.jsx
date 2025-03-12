import Item from "../../components/subComponents/Item";
import CompareCommitChart from "../../components/subComponents/CompareCommitsChart";
import ScoreList from "../../components/subComponents/ScoreList";

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