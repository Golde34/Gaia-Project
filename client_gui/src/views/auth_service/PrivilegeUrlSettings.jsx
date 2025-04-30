import { Button, Card, Col, Flex, Grid, Metric, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, TextInput, Title } from "@tremor/react";
import { SearchCircleIcon } from "@heroicons/react/solid";
import { useState } from "react";
import ManagerTemplate from "../../components/template/ManagerTemplate";

function ContentArea() {
    const [text, setText] = useState("");
    const searchInput = () => {
        onSearch(text);
    }

    const [privilege, setPrivilege] = useState("WRITE_USER");

    return (
        <>
            <Metric style={{ marginBottom: '30px', marginTop: '30px' }}
                className="text-2xl font-bold text-gray-800"> Privilege Url Settings
            </Metric>
            <div className="grid md:grid-cols-5 grid-cols-1 w-full">
                <div className="col-span-3">
                    <div className="w-full flex flex-col justify-between p-2">
                        <div className="flex-auto w-full">
                            <Card>
                                <Flex>
                                    <Title>List Privilege</Title>
                                </Flex>
                                <Table className="mt-5">
                                    <TableHead>
                                        <TableRow>
                                            <TableHeaderCell>Privilege Name</TableHeaderCell>
                                            <TableHeaderCell>Description</TableHeaderCell>
                                            <TableHeaderCell>Url</TableHeaderCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>Admin</TableCell>
                                            <TableCell>Admin</TableCell>
                                            <TableCell>
                                                <Grid numItems={1}>
                                                    <Col numColSpan={1}>
                                                        <p>/admin</p>
                                                    </Col>
                                                    <Col>
                                                        <Button type="button" className="m-2">Add more urls</Button>
                                                    </Col>
                                                </Grid>
                                            </TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>Super Admin</TableCell>
                                            <TableCell>Super Admin</TableCell>
                                            <TableCell>
                                                <Grid>
                                                    <Col numColSpan={1}>
                                                        <p>/super-admin</p>
                                                    </Col>
                                                    <Col>
                                                        <Button type="button" className="m-2">Add more urls</Button>
                                                    </Col>
                                                </Grid>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Card>
                        </div>
                    </div>
                </div>
                <div className="col-span-2 w-full">
                    <div className="w-full p-2">
                        <Card className="max-w-full mx-auto">
                            <Grid numItems={1}>
                                <Col numColSpan={1}><Title>Privilege Search</Title></Col>
                                <Col numColSpan={1} className="mt-2">
                                    <Flex>
                                        <TextInput icon={SearchCircleIcon} placeholder="Search"
                                            value={text} onChange={(e) => { setText(e.target.value) }} />
                                        <Button className="ms-2" onClick={searchInput}>Search</Button>
                                        {/* <Button className="ms-2" onClick={searchInputV2(text)}>Search V2</Button> */}
                                    </Flex>
                                </Col>
                            </Grid>
                        </Card>
                        <Card className="mt-4">
                            <Title>Privilege Urls</Title>
                            <Title>{privilege}</Title>
                            <Table className="mt-5">
                                <TableHead>
                                    <TableRow>
                                        <TableHeaderCell>Url</TableHeaderCell>
                                        <TableHeaderCell>Description</TableHeaderCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow>
                                        <TableCell>/admin</TableCell>
                                        <TableCell>Admin</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell>/super-admin</TableCell>
                                        <TableCell>Super Admin</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Card>
                    </div>
                </div>
                <div className="col-span-5">
                    <div className="w-full flex flex-col justify-between p-2">
                        <div className="flex-auto w-full">
                            <Card>
                                <Title>List Urls</Title>
                                <Table className="mt-5">
                                    <TableHead>
                                        <TableRow>
                                            <TableHeaderCell>Url</TableHeaderCell>
                                            <TableHeaderCell>Description</TableHeaderCell>
                                            <Table>Privileges</Table>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>/admin</TableCell>
                                            <TableCell>Admin</TableCell>
                                            <TableCell>Admin</TableCell>
                                        </TableRow>
                                        <TableRow>
                                            <TableCell>/super-admin</TableCell>
                                            <TableCell>Super Admin</TableCell>
                                            <TableCell>Super Admin</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

function PrivilegeUrlSettings() {
    return (
        <ManagerTemplate>
            <ContentArea />
        </ManagerTemplate>
    )
}

export default PrivilegeUrlSettings; 