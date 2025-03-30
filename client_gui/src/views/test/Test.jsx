import Template from "../../components/template/Template"
import { CreateScheduleGroupDialog } from "../../screens/scheduleTaskScreen/CreateScheduleTask";

function ContentArea() {
    const userId = "1";
    return (
        <>
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