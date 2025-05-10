import LeftColumn from "./LeftColumn"
import Template from "../components/template/Template"
import RightColumn from "./RightColumn"
import { useDispatch, useSelector } from "react-redux"
import { useCallback, useEffect, useRef } from "react";
import { getNotificationJwt } from "../api/store/actions/auth_service/auth.actions";

function ContentArea() {
  const dispatch = useDispatch();

  const jwtNotification = useSelector((state) => state.notificationJwt)
  const { loading, error, notificationJwt } = jwtNotification;
  const userNotification = useCallback(() => {
    dispatch(getNotificationJwt());
  }, [dispatch]);
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      userNotification();
    }, 200);
  })

  useEffect(() => {
    if (notificationJwt) {
      localStorage.setItem('notificationJwt', JSON.parse(notificationJwt).jwt);
    }
  })

  return (
    <div className="grid md:grid-cols-3 grid-cols-1 w-full">
      <div className="col-span-2">
        <LeftColumn />
      </div>
      <div className="w-full">
        <RightColumn />
      </div>
    </div>
  )
}

const Dashboard = () => {
  return (
    <>
      <Template>
        <ContentArea />
      </Template>
    </>
  )
}

export default Dashboard;