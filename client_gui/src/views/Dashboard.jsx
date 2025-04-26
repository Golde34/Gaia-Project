import LeftColumn from "./LeftColumn"
import Template from "../components/template/Template"
import RightColumn from "./RightColumn"
import { isAccessTokenCookieValid } from "../kernels/utils/cookie-utils";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ContentArea() {
  const navigate = useNavigate();
  const isUserValid = isAccessTokenCookieValid();
  useEffect(() => {
    if (isUserValid) {
      navigate('/signin');
    }
  }, [isUserValid, navigate]);

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