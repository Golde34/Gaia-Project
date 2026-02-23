import { Button, Card, Col, Flex, Grid, Subtitle, Title } from "@tremor/react";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserGithubInfo, synchronizeUserGithubInfo } from "../../api/store/actions/contribution_tracker/user-commit.actions";
import MessageBox from "../../components/subComponents/MessageBox";
import GithubSyncProjectScreen from "../projectScreen/GithubSyncProjectScreen";

const UserGithubScreen = (props) => {
    const user = props.user;

    const dispatch = useDispatch();

    const userGithub = useSelector(state => state.userGithubInfo);
    const { loading, error, userGithubInfo } = userGithub;
    const findUserGithubInfo = useCallback(() => {
        dispatch(getUserGithubInfo());
    }, [dispatch]);
    const debounceRef = useRef(null);
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            findUserGithubInfo();
        }, 200);
        console.log("userGithubInfo: ", userGithubInfo);
        return () => clearTimeout(debounceRef.current);
    }, [findUserGithubInfo, userGithubInfo]);

    const syncUserGithubInfo = () => {
        dispatch(synchronizeUserGithubInfo());
        window.location.reload();
    }

    return (
        <div>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <MessageBox message={error}></MessageBox>
            ) : userGithubInfo.userGithubInfo && userGithubInfo.userGithubInfo.userConsent == 0 ? (
                <Card>
                    <Flex justifyContent="center" alignItems="center" className="mb-4">
                        <Title className="text-white text-xl font-bold">Your Github Information</Title>
                    </Flex>
                    <Flex justifyContent="space-between" alignItems="center" className="mt-4">
                        <p className="text-gray-400 font-medium">
                            Do you want to integrate your Github Commit to Gaia Contribution Tracking System?
                        </p>
                        <Button
                            className="flex justify-end"
                            variant="primary"
                            color="indigo"
                            // onClick={openModal}
                            onClick={() => {
                                const clientId = userGithubInfo.githubConfiguration.clientId;
                                const redirectUrl = userGithubInfo.githubConfiguration.redirectUrl;
                                const state = userGithubInfo.userGithubInfo.userState;
                                const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUrl}&scope=user,repo&state=${state}`;
                                window.location.href = url;
                            }}
                        > Integrate</Button>
                    </Flex>
                </Card>
            ) : (
                <>
                    <div className="grid md:grid-cols-5 grid-cols-1 w-full">
                        <div className="col-span-2">
                            <div className="w-full flex flex-col justify-between">
                                <div className="flex-auto w-full">
                                    <Card>
                                        <Flex justifyContent="center" alignItems="center" className="mb-4">
                                            <Title className="text-white text-xl font-bold">Your Github Information</Title>
                                        </Flex>
                                        <Grid className="mt-4 gap-y-4" numItems={5}>
                                            <Col numColSpan={2}>
                                                <Subtitle className="text-gray-400 font-medium">Username</Subtitle>
                                            </Col>
                                            <Col numColSpan={3}>
                                                <p className="text-md text-gray-500 font-semibold">{user.username || "N/A"}</p>
                                            </Col>
                                            <Col numColSpan={2}>
                                                <Subtitle className="text-gray-400 font-medium">Github Login Name</Subtitle>
                                            </Col>
                                            <Col numColSpan={3}>
                                                <p className="text-gray-500 text-md font-semibold hover:underline">
                                                    {
                                                        userGithubInfo.userGithubInfo.githubUrl ? (
                                                            <a href={userGithubInfo.userGithubInfo.githubUrl} target="_blank" rel="noopener noreferrer">{userGithubInfo.userGithubInfo.githubLoginName}</a>
                                                        ) : (
                                                            <Button
                                                                className="flex justify-end"
                                                                variant="primary"
                                                                color="indigo"
                                                                onClick={syncUserGithubInfo}
                                                            >Synchronize Github Information with GAIA</Button>
                                                        )
                                                    }
                                                </p>
                                            </Col>
                                        </Grid>
                                    </Card>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-3 w-full">
                            <div className='w-full ms-4'>
                                <GithubSyncProjectScreen />
                            </div>
                        </div>
                    </div>
                </>
            )
            }
        </div >
    )
}

export default UserGithubScreen;