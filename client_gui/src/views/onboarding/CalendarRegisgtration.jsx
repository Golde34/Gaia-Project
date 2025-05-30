import { useDispatch, useSelector } from "react-redux";
import { queryTaskConfig } from "../../api/store/actions/onboarding/task-registration.actions";

const CalendarRegistration = (props) => {
    const redirectPage = propTypesSelected.redirectPage;
    const dispatch = useDispatch();

    const calendarRegistration = useSelector((state) => state.queryTaskConfig);
    const { loading, error, taskRegistry } = calendarRegistration;

    const calendarConfig = useCallback(() => {
        dispatch()
    })
}