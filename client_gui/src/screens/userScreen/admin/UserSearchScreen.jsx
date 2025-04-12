import { SearchCircleIcon } from "@heroicons/react/outline";
import { Button, Card, Col, Flex, Grid, TextInput, Title } from "@tremor/react";
import { useState } from "react";

const UserSearchScreen = ({ onSearch }) => {
    const [text, setText] = useState("");
    const searchInput = () => {
        onSearch(text);
    }
    const searchInputV2 = (text) => {
        onSearch(text);
    }
    return (
        <>
            <Card className="max-w-full mx-auto">
                <Grid numItems={1}>
                    <Col numColSpan={1}><Title>User Search</Title></Col>
                    <Col numColSpan={1} className="mt-2">
                        <Flex>
                            <TextInput icon={SearchCircleIcon} placeholder="Search"
                                value={text} onChange={(e) => { setText(e.target.value) }} />
                            {/* <Button className="ms-2" onClick={searchInput}>Search</Button> */}
                            <Button className="ms-2" onClick={searchInputV2(text)}>Search V2</Button>
                        </Flex>
                    </Col>
                </Grid>
            </Card>
        </>
    )
}

export default UserSearchScreen;