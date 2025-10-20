import Template from "../../components/template/Template"
import { Card, Col, Grid, Metric, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "../../api/store/actions/auth_service/user.actions";
import MessageBox from "../../components/subComponents/MessageBox";
import UserSettingScreen from "../../screens/userScreen/UserSettingScreen";
import UserProfileInfoScreen from "../../screens/userScreen/UserProfileScreen";
import UserGithubScreen from "../../screens/userScreen/UserGihubScreen";
import LLMModelSettingScreen from "../../screens/userScreen/LLMModelSetting";

function ContentArea() {
    const dispatch = useDispatch();

    const profile = useSelector(state => state.userDetail);
    const { loading, error, user } = profile;
    const getUserProfile = useCallback(() => {
        dispatch(userProfile());
    }, [dispatch]);
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
                    <TabGroup>
                        <TabList className="mt-4" variant="solid">
                            <Tab>Profile</Tab>
                            <Tab>LLM Model Settings</Tab>
                            <Tab>Github Settings</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <Grid numItems={7} className="mt-4">
                                    <Col numColSpan={3}>
                                <div className="flex-auto w-full p-2" >
                                    <UserProfileInfoScreen user={user} />
                                </div>
                                </Col>
                                <Col numColSpan={4}>
                                <div className='w-full p-2'>
                                    <UserSettingScreen user={user} />
                                </div>
                                </Col>
                                </Grid>
                            </TabPanel>
                            <TabPanel>
                                <div className="w-full p-2 mt-2">
                                    <LLMModelSettingScreen user={user} model={user.llmModels[0].modelName} />
                                </div>
                            </TabPanel>
                            <TabPanel>
                                <div className="flex-auto w-full p-2">
                                    <UserGithubScreen user={user} />
                                </div>
                            </TabPanel>
                        </TabPanels>
                    </TabGroup>
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