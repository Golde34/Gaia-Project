import Template from "../../components/template/Template"
import { Card, Col, Grid, Metric, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "../../api/store/actions/auth_service/user.actions";
import MessageBox from "../../components/subComponents/MessageBox";
import UserSettingScreen from "../../screens/userScreen/UserSettingScreen";
import UserProfileInfoScreen from "../../screens/userScreen/UserProfileScreen";
import UserGithubScreen from "../../screens/userScreen/UserGihubScreen";
import LLMModelSettingScreen from "../../screens/userScreen/LLMModelSetting";
import SettingsSidebar from "../../components/SettingsSidebar";

function ContentArea() {
    const dispatch = useDispatch();

    const profileSidebarItems = [
        {
            id: "profile-overview",
            label: "Profile overview",
            description: "Personal and account information",
        },
        {
            id: "user-preferences",
            label: "User settings",
            description: "Privacy preferences and task optimization",
        },
    ];

    const llmSidebarItems = [
        {
            id: "llm-models",
            label: "LLM models",
            description: "Select and manage the active model",
        },
    ];

    const githubSidebarItems = [
        {
            id: "github-config",
            label: "Github settings",
            description: "Connect and configure Github integration",
        },
    ];

    const [activeProfileSection, setActiveProfileSection] = useState(profileSidebarItems[0].id);
    const [activeLlmSection, setActiveLlmSection] = useState(llmSidebarItems[0].id);
    const [activeGithubSection, setActiveGithubSection] = useState(githubSidebarItems[0].id);

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
                                <Grid numItems={6} className="mt-4 gap-4">
                                    <Col numColSpan={2}>
                                        <SettingsSidebar
                                            title="User profile"
                                            items={profileSidebarItems}
                                            activeItemId={activeProfileSection}
                                            onSelect={setActiveProfileSection}
                                        />
                                    </Col>
                                    <Col numColSpan={4}>
                                        <div className="w-full p-2">
                                            {activeProfileSection === "profile-overview" && (
                                                <UserProfileInfoScreen user={user} />
                                            )}
                                            {activeProfileSection === "user-preferences" && (
                                                <UserSettingScreen user={user} />
                                            )}
                                        </div>
                                    </Col>
                                </Grid>
                            </TabPanel>
                            <TabPanel>
                                <Grid numItems={6} className="mt-4 gap-4">
                                    <Col numColSpan={2}>
                                        <SettingsSidebar
                                            title="LLM models"
                                            items={llmSidebarItems}
                                            activeItemId={activeLlmSection}
                                            onSelect={setActiveLlmSection}
                                        />
                                    </Col>
                                    <Col numColSpan={4}>
                                        <div className="w-full p-2 mt-2">
                                            {activeLlmSection === "llm-models" && (
                                                <LLMModelSettingScreen user={user} model={user.llmModels[0].modelName} />
                                            )}
                                        </div>
                                    </Col>
                                </Grid>
                            </TabPanel>
                            <TabPanel>
                                <Grid numItems={6} className="mt-4 gap-4">
                                    <Col numColSpan={2}>
                                        <SettingsSidebar
                                            title="Github"
                                            items={githubSidebarItems}
                                            activeItemId={activeGithubSection}
                                            onSelect={setActiveGithubSection}
                                        />
                                    </Col>
                                    <Col numColSpan={4}>
                                        <div className="flex-auto w-full p-2">
                                            {activeGithubSection === "github-config" && (
                                                <UserGithubScreen user={user} />
                                            )}
                                        </div>
                                    </Col>
                                </Grid>
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