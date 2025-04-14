import Item from "../components/subComponents/Item";
import CompareCommitChart from "../components/subComponents/CompareCommitsChart";

const RightColumn = () => {
	return (
		<div className="w-full p-2">
			<CompareCommitChart />
			<Item />
		</div>
	);
};

export default RightColumn;