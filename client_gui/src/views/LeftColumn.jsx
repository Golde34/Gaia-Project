import TableComponent from "../components/subComponents/TableComponent"
import TopTask from "../screens/dashboardScreen/TopTaskComponent";
import UserContributionCalendar from "../screens/dashboardScreen/UserContributionCalendar";

const LeftColumn = () => {
    

    return (
        <div className="w-full flex flex-col justify-between p-2">
            <div className="flex flex-col lg:flex-rpw gap-2 w-full">
                <TopTask /> 
            </div>
            <div className="flex-auto w-full">
                <UserContributionCalendar />
                <TableComponent />
            </div>
        </div>
    );
};

export default LeftColumn;