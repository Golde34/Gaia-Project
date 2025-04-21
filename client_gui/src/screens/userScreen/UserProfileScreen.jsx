import { Button, Card, Col, Flex, Grid, Subtitle, Text, Title } from "@tremor/react";

const UserProfileInfoScreen = (props) => {
    const user = props.user;
    return (
        <Card>
            <Flex justifyContent="center" alignItems="center" className="mb-3">
                <Title className="text-white text-xl font-bold">Your profile</Title>
            </Flex>
            <Grid className="mt-3" numItems={5}>
                <Col numColSpan={2}>
                    <Subtitle>Username</Subtitle>

                </Col>
                <Col numColSpan={3}>
                    <Text className="text-white text-md">{user.name}</Text>
                </Col>

                <Col numColSpan={2}>
                    <Subtitle>Email</Subtitle>
                </Col>
                <Col numColSpan={3}>
                    <Text className="text-white text-md">{user.email}</Text>
                </Col>

                <Col numColSpan={2}>
                    <Subtitle>Last Login</Subtitle>
                </Col>
                <Col numColSpan={3}>
                    <Text className="text-white text-md">{user.lastLogin}</Text>
                </Col>

                <Col numColSpan={2}>
                    <Subtitle>Is Using 2FA</Subtitle>
                </Col>
                <Col numColSpan={3}>
                    <Text className="text-white text-md">Coming soon</Text>
                </Col>

                <Col numColSpan={2}>
                    <Subtitle>Role</Subtitle>
                </Col>
                <Col numColSpan={3}>
                    <Text>{user.roles[0].name}</Text>
                </Col>
                <Col numColSpan={2}>
                    <Subtitle>Your LLM Model</Subtitle>
                </Col>
                <Col numColSpan={3}>
                    <Text>{user.llmModels[0].modelName}</Text>
                </Col>

            </Grid>
            <div className="flex justify-end p-2 rounded-lg mb-3">
                <Button
                    className="flex justify-end"
                    variant="primary"
                    color="indigo"
                    onClick={() => {
                        navigate('/privilege-role-dashboard');
                    }}
                > Privilege And Role Dashboard</Button>
            </div>
        </Card>
    )
}

export default UserProfileInfoScreen;
