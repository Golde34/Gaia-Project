import Template from "../../components/template/Template"
import { CreateScheduleTaskDialog } from "../../screens/scheduleTaskScreen/CreateScheduleTask";

function ContentArea() {
    const userId = "1";
    return (
        <>
            <CreateScheduleTaskDialog userId={userId} />
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