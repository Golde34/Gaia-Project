import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bold, Button, Card, Col, Divider, DonutChart, Flex, Grid, Legend, Metric, Tab, TabGroup, TabList, Table, TableBody, TableHead, TableHeaderCell, TableRow, Text, Title } from "@tremor/react";
import { getRoles } from "../../../api/store/actions/auth_service/role.actions";
import { ChartPieIcon, ViewListIcon } from "@heroicons/react/solid";
import { useNavigate } from "react-router-dom";

const UserRolesScreen = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const listRoles = useSelector((state) => state.roleList);
    const { loading, error, roles } = listRoles;

    const getRoleList = useCallback(() => {
        dispatch(getRoles());
    }, [dispatch]);

    const debounceRef = useRef(null);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            getRoleList();
        }, 200);
        return () => clearTimeout(debounceRef.current);
    }, [getRoleList]);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const chartDataFormatter = (number) => {
        return "Total Users: " + Intl.NumberFormat("us").format(number).toString();
    }

    return (
        <>
            {loading ? (
                <p> Loading </p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <>
                    <Card className="max-w-full mx-auto mt-4">
                        <Grid numItems={3}>
                            <Col numColSpan={1}><Title>Role List</Title></Col>
                            <Col numColSpan={2}>
                                <Flex className="justify-end">
                                    <TabGroup index={selectedIndex} onIndexChange={setSelectedIndex}>
                                        <TabList variant="solid">
                                            <Tab icon={ChartPieIcon}>Chart</Tab>
                                            <Tab icon={ViewListIcon}>List</Tab>
                                        </TabList>
                                    </TabGroup>
                                </Flex>
                            </Col>
                        </Grid>
                        <div className="flex flex-row">
                            <Text className="mt-8 me-5">
                                Number Of Users:
                            </Text>
                            <Metric className="mt-5">{roles[roles.length - 1].totalNumberOfUsers}</Metric>
                        </div>
                        <Divider />
                        {selectedIndex === 0 ? (
                            <>
                                <DonutChart
                                    data={roles}
                                    valueFormatter={chartDataFormatter}
                                    category="numberOfUsers"
                                    index="name"
                                    showAnimation={true}
                                    variant="pie"
                                    colors={['blue', 'cyan', 'indigo']}
                                    className="mt-6"
                                />
                                <Legend
                                    categories={roles.map((role) => role.name)}
                                    colors={['blue', 'cyan', 'indigo']}
                                    className="justify-center mt-4"
                                />
                            </>
                        ) : (
                            <>
                                <Flex className="mt-6" justifyContent="between">
                                    <Text className="truncate">
                                        <Bold>Roles</Bold>
                                    </Text>
                                </Flex>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableHeaderCell><Title>Role Name</Title></TableHeaderCell>
                                            <TableHeaderCell><Title>Number Of Users</Title></TableHeaderCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {roles.map((role) => (
                                            <TableRow key={role.id}>
                                                <TableHeaderCell>{role.name}</TableHeaderCell>
                                                <TableHeaderCell>{role.numberOfUsers}</TableHeaderCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </>
                        )}
                        <Divider />
                        <Flex className="mt-6 justify-center" >
                            <Button
                                onClick={() => navigate('/privilege-role-dashboard')}
                            >Privileges and Roles Dashboard</Button>
                            <Button className="ms-2"
                                onClick={() => navigate('/privilege-url-settings')}
                            >Privilege Urls Settings</Button>
                        </Flex>
                    </Card>
                </>
            )
            }
        </>
    )
}

export default UserRolesScreen;