import Template from "../../components/template/Template"
import { Metric, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userProfile } from "../../api/store/actions/auth_service/user.actions";
import MessageBox from "../../components/subComponents/MessageBox";
import UserSettingScreen from "../../screens/userScreen/UserSettingScreen";
import UserProfileInfoScreen from "../../screens/userScreen/UserProfileScreen";
import UserGithubScreen from "../../screens/userScreen/UserGihubScreen";
import LLMModelSettingScreen from "../../screens/userScreen/LLMModelSetting";
import SettingsSectionLayout from "../../components/SettingsSectionLayout";

function ContentArea() {
    const dispatch = useDispatch();

    const profile = useSelector(state => state.userDetail);
    const { loading, error, user } = profile;

    const profileTitle = "User Profile";
    const profileSections = useMemo(() => ([
        {
            id: "profile-overview",
            label: "Profile overview",
            description: "Personal and account information",
            content: <UserProfileInfoScreen user={user} />,
        },
        {
            id: "user-preferences",
            label: "User settings",
            description: "Privacy preferences and task optimization",
            content: <UserSettingScreen user={user} />,
        },
    ]), [user]);

    const llmSettingTitle = "LLM Model Settings";
    const llmSections = useMemo(() => ([
        {
            id: "llm-models",
            label: "LLM models",
            description: "Select and manage the active model",
            renderContent: () => user?.llmModels?.[0] ? <LLMModelSettingScreen user={user} model={user.llmModels[0].modelName} /> : null,
        },
    ]), [user]);

    const integrationSettingsTitle = "Integration Settings";
    const integrationSetting = useMemo(() => ([
        {
            id: "github-config",
            label: "Github settings",
            description: "Connect and configure Github integration",
            content: <UserGithubScreen user={user} />,
        },
    ]), [user]);
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
                            <Tab>{profileTitle}</Tab>
                            <Tab>{llmSettingTitle}</Tab>
                            <Tab>{integrationSettingsTitle}</Tab>
                        </TabList>
                        <TabPanels>
                            <TabPanel>
                                <SettingsSectionLayout
                                    sidebarTitle={profileTitle}
                                    sections={profileSections}
                                    contentContainerClassName="w-full p-2"
                                />
                            </TabPanel>
                            <TabPanel>
                                <SettingsSectionLayout
                                    sidebarTitle={llmSettingTitle}
                                    sections={llmSections}
                                    contentContainerClassName="w-full p-2"
                                />
                            </TabPanel>
                            <TabPanel>
                                <SettingsSectionLayout
                                    sidebarTitle={integrationSettingsTitle}
                                    sections={integrationSetting}
                                    contentContainerClassName="flex-auto w-full p-2"
                                />
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