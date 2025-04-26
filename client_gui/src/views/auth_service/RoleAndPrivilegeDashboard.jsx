import { Button, Card, Col, Grid, Metric, Switch, Title } from "@tremor/react";
import RoleDashboard from "./RoleDashboard";
import PrivilegeDashboard from "./PrivilegeDashboard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ManagerTemplate from "../../components/template/ManagerTemplate";
import { isAccessTokenCookieValid } from "../../kernels/utils/cookie-utils";

function ContentArea() {
    const navigate = useNavigate();

    const isUserValid = isAccessTokenCookieValid();
    useEffect(() => {
        if (isUserValid) {
            navigate('/signin');
        }
    }, [isUserValid, navigate]);

    const [isRoleSwitchOn, setIsRoleSwitchOn] = useState(true);
    const [isPrivilegeSwitchOn, setIsPrivilegeSwitchOn] = useState(false);

    const handleRoleSwitchChange = (e) => {
        setIsRoleSwitchOn(e);
    }

    const handlePrivilegeSwitchChange = (e) => {
        setIsPrivilegeSwitchOn(e);
    }

    return (
        <>
            <Metric style={{ marginBottom: '30px', marginTop: '30px' }}
                className="text-2xl font-bold text-gray-800">Role & Privilege Settings
            </Metric>
            <Card>
                <div className="flex justify-end">
                    <Button type="button" onClick={() => navigate('/privilege-url-settings')}
                        className="me-10">
                        Privilege Url Settings
                    </Button>
                    <Switch
                        id="role-switch"
                        name="role-switch"
                        checked={isRoleSwitchOn}
                        className="me-2"
                        onChange={handleRoleSwitchChange} />
                    <label htmlFor="role-switch" className="me-5 ms-2"
                    ><Title>Role Dashboard</Title></label>
                    <Switch
                        id="privilege-switch"
                        name="privilege-switch"
                        checked={isPrivilegeSwitchOn}
                        className="ms-5"
                        onChange={handlePrivilegeSwitchChange} />
                    <label htmlFor="privielge-switch" className="me-5 ms-2"
                    ><Title>Privilege Dashboard</Title></label>
                </div>
            </Card>
            <Grid numItems={1}>
                {isRoleSwitchOn ? (
                    <Col numColSpan={1}>
                        <RoleDashboard />
                    </Col>
                ) : (
                    <></>
                )}
                {isPrivilegeSwitchOn ? (
                    <Col numColSpan={1}>
                        <PrivilegeDashboard />
                    </Col>
                ) : (
                    <></>
                )}
            </Grid>
        </>
    )
}

const PrivilegeAndRoleDashboard = () => {
    return (
        <ManagerTemplate>
            <ContentArea />
        </ManagerTemplate>
    )
}

export default PrivilegeAndRoleDashboard;