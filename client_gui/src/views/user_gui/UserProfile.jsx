import Template from "../../components/template/Template"
import { Metric, Tab, TabGroup, TabList, TabPanel, TabPanels } from "@tremor/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { userProfile } from "../../api/store/actions/auth_service/user.actions";
import MessageBox from "../../components/subComponents/MessageBox";
import UserSettingScreen from "../../screens/userScreen/UserSettingScreen";
import UserProfileInfoScreen from "../../screens/userScreen/UserProfileScreen";
import UserGithubScreen from "../../screens/userScreen/UserGihubScreen";
import LLMModelSettingScreen from "../../screens/userScreen/LLMModelSetting";
import SettingsSectionLayout from "../../components/SettingsSectionLayout";
import { ComingSoonComponent } from "../../components/subComponents/ComingSoonComponent";

function ContentArea() {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();

    const tabParam = searchParams.get("tab");
    const sectionParam = searchParams.get("section");
    const tabIndexMap = {
        "profile": 0,
        "llm-settings": 1,
        "integration": 2
    };
    const initialTabIndex = tabParam && tabIndexMap[tabParam] !== undefined 
        ? tabIndexMap[tabParam] 
        : 0;

    const [selectedTabIndex, setSelectedTabIndex] = useState(initialTabIndex);

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
        {
            id: "assistant-memory",
            label: "Tunning assistant memory",
            description: "Configure memory settings for your LLM model",
            content: <ComingSoonComponent />,
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

    const getValidSectionId = (sections) => {
        if (!sectionParam) return undefined;
        const sectionExists = sections.some(s => s.id === sectionParam);
        return sectionExists ? sectionParam : undefined;
    };

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
                    <TabGroup index={selectedTabIndex} onIndexChange={setSelectedTabIndex}>
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
                                    defaultSectionId={selectedTabIndex === 0 ? getValidSectionId(profileSections) : undefined}
                                />
                            </TabPanel>
                            <TabPanel>
                                <SettingsSectionLayout
                                    sidebarTitle={llmSettingTitle}
                                    sections={llmSections}
                                    contentContainerClassName="w-full p-2"
                                    defaultSectionId={selectedTabIndex === 1 ? getValidSectionId(llmSections) : undefined}
                                />
                            </TabPanel>
                            <TabPanel>
                                <SettingsSectionLayout
                                    sidebarTitle={integrationSettingsTitle}
                                    sections={integrationSetting}
                                    contentContainerClassName="flex-auto w-full p-2"
                                    defaultSectionId={selectedTabIndex === 2 ? getValidSectionId(integrationSetting) : undefined}
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