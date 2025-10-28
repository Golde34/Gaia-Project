import DoneTasksComponent from "../screens/dashboardScreen/DoneTasksComponent";
import CompareCommitChart from "../components/subComponents/CompareCommitsChart";
import ChatComponent from "./chat_hub/ChatComponent";

const RightColumn = () => {
	return (
		<div className="w-full p-2">
			<CompareCommitChart />
			<DoneTasksComponent />
			<ChatComponent isDashboard={true} chatType={"chitchat_message"}/>
		</div>
	);
};

export default RightColumn;