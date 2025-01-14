import { Button, Card, Col, Flex, Grid, Subtitle, Text, Title } from "@tremor/react";
import { useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserGithubInfo, synchronizeUserGithubInfo } from "../../api/store/actions/contribution_tracker/user-commit.actions";
import MessageBox from "../../components/subComponents/MessageBox";

const UserGithubScreen = (props) => {
    const user = props.user;

    const dispatch = useDispatch();

    const userGithub = useSelector(state => state.userGithubInfo);
    const { loading, error, userGithubInfo } = userGithub;
    const findUserGithubInfo = useCallback(() => {
        dispatch(getUserGithubInfo(user.id));
    }, [dispatch, user.id]);
    const debounceRef = useRef(null);
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            findUserGithubInfo();
        }, 200);
        console.log("userGithubInfo: ", userGithubInfo);
    }, []);

    const syncUserGithubInfo = () => {
        dispatch(synchronizeUserGithubInfo(user.id));
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
                    <Card>
                        <Flex justifyContent="center" alignItems="center" className="mb-4">
                            <Title className="text-white text-xl font-bold">Your Github Information</Title>
                        </Flex>
                        <Grid className="mt-4 gap-y-4" numItems={5}>
                            <Col numColSpan={1}>
                                <Subtitle className="text-gray-400 font-medium">Username</Subtitle>
                            </Col>
                            <Col numColSpan={4}>
                                <Text className="text-white text-md font-semibold">{user.username || "N/A"}</Text>
                            </Col>
                            <Col numColSpan={1}>
                                <Subtitle className="text-gray-400 font-medium">Github URL</Subtitle>
                            </Col>
                            <Col numColSpan={4}>
                                <Text className="text-blue-400 text-md font-semibold hover:underline">
                                    {
                                        userGithubInfo.userGithubInfo.githubUrl ? (
                                            <a href={userGithubInfo.userGithubInfo.githubUrl} target="_blank" rel="noopener noreferrer">{userGithubInfo.userGithubInfo.githubUrl}</a>
                                        ) : (
                                            <Button
                                                className="flex justify-end"
                                                variant="primary"
                                                color="indigo"
                                                onClick={syncUserGithubInfo}
                                            >Synchronize Github Information with GAIA</Button>
                                        )
                                    }
                                </Text>
                            </Col>
                        </Grid>
                    </Card>
                </>
            )
            }
        </div >
    )
}

export default UserGithubScreen;