import Template from "../../components/template/Template"
import { CreateScheduleGroupDialog } from "../../screens/scheduleTaskScreen/CreateScheduleGroup";

function ContentArea() {
    const userId = "1";
    return (
        <>
            <h1 className="font-bold text-gray-300 flex items-center space-x-2">
                <img src="/gaia_logo.png" alt="logo" className="h-10 w-10 inline-block" />
            </h1>

            <CreateScheduleGroupDialog userId={userId} />
        </>
    )
}

const Test = () => {
    return (
        <>
            <Template>
                <ContentArea />
            </Template>
        </>
    )
}

export default Test;