import { useNavigate } from "react-router-dom";
import ManagerTemplate from "../../components/template/ManagerTemplate"
import { isAccessTokenCookieValid } from "../../kernels/utils/cookie-utils";
import LeftColumn from "../LeftColumn";
import RightColumn from "../RightColumn";
import { useEffect } from "react";

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

const GaiaManagerDashboard = () => {
    return (
        <ManagerTemplate>
            <ContentArea />
        </ManagerTemplate>
    )
}

export default GaiaManagerDashboard;