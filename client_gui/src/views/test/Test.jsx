import { DatePicker } from "@tremor/react"
import Template from "../../components/template/Template"

function ContentArea() {
    const startDate = new Date();
    const setStartDate = () => {
        console.log("Start Date")
    }
    return (
        <DatePicker
            className="max-w-md mx-auto"
            onValueChange={setStartDate}
            minDate={new Date()}
            value={startDate}
            displayFormat="dd/MM/yyyy"
        ></DatePicker>
        
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