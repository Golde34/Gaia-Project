import { Button, Card, Col, Flex, Grid, Metric, Subtitle, Text, Title } from "@tremor/react";
import Template from "../../components/template/Template"
import { useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { isAccessTokenCookieValid } from "../../kernels/utils/cookie-utils";
import { userProfile } from "../../api/store/actions/auth_service/user.actions";
import MessageBox from "../../components/subComponents/MessageBox";
import UserSettingScreen from "../../screens/userScreen/UserSettingScreen";
import UserProfileInfoScreen from "../../screens/userScreen/UserProfileScreen";
import UserGithubScreen from "../../screens/userScreen/UserGihubScreen";

function ContentArea() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const userId = "1";

    const isUserValid = isAccessTokenCookieValid();
    useEffect(() => {
        if (isUserValid) {
            navigate('/signin');
        }
    }, [isUserValid, navigate]);

    const profile = useSelector(state => state.userDetail);
    const { loading, error, user } = profile;
    const getUserProfile = useCallback(() => {
        dispatch(userProfile(userId));
    }, [dispatch, userId]);
    const debounceRef = useRef(null);
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            getUserProfile();
        }, 200);
    }, [])

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <MessageBox message={error}></MessageBox>
            ) : (
                <>
                    <Metric style={{ marginBottom: '30px', marginTop: '30px' }}
                        className='text-2xl font-bold text-gray-800'>User Profile</Metric>
                    <div className="grid md:grid-cols-5 grid-cols-1 w-full">
                        <div className="col-span-2">
                            <div className="w-full flex flex-col justify-between p-2">
                                <div className="flex-auto w-full">
                                    <UserProfileInfoScreen user={user} />
                                </div>
                            </div>
                            <div className="w-full flex flex-col justify-between p-2">
                                <div className="flex-auto w-full">
                                    <UserGithubScreen user={user}/>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-3 w-full">
                            <div className='w-full p-2'>
                                <UserSettingScreen user={user} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div >
    )
}

const UserProfile = () => {
    return (
        <Template>
            <ContentArea />
        </Template>
    )
}

export default UserProfile;