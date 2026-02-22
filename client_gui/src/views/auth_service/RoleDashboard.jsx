import { Card, Flex, Metric, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Title } from "@tremor/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getRoles } from "../../api/store/actions/auth_service/role.actions";
import RoleListScreen from "../../screens/roleScreen/RoleListScreen";
import InsertPrivilegeModal from "../../screens/roleScreen/InsertPrivilegeModal";

function RoleDashboard() {
    const dispatch = useDispatch();

    const [roleName, setRoleName] = useState("ROLE_BOSS");

    const listRole = useSelector((state) => state.roleList);
    const { loading, error, roles } = listRole;

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

    let [isPrivilegeOpen, setPrivilegeOpen] = useState(false);
    function closePrivilegeModal() {
        setPrivilegeOpen(false)
    }
    function openPrivilegeModal() {
        setPrivilegeOpen(true)
    } 

    return (
        <>
            {
                loading ? (
                    <p> Loading...</p >
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <>
                        <Metric style={{ marginBottom: '30px', marginTop: '30px' }}
                            className="text-2xl font-bold text-gray-800"> Role Dashboard
                        </Metric>
                        <div className="grid md:grid-cols-5 grid-cols-1 w-full">
                            <div className="col-span-3">
                                <div className="w-full flex flex-col justify-between p-2">
                                    <div className="flex-auto w-full">
                                        <Card>
                                            <Flex>
                                                <Title>List of Role's Privileges</Title>
                                                <button
                                                    type="button"
                                                    className="m-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 
                                                                px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none 
                                                                focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                                    onClick={() => {
                                                        openPrivilegeModal();
                                                    }}
                                                >
                                                    Insert Privilege
                                                </button>
                                            </Flex>
                                            <Title>{roleName}</Title>
                                            <Table className="mt-5">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableHeaderCell>Privileges</TableHeaderCell>
                                                        <TableHeaderCell>Description</TableHeaderCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {roles.map((r) => {
                                                        if (r.name === roleName) {
                                                            return r.privileges.map((privilege) => (
                                                                <TableRow key={privilege.id}>
                                                                    <TableCell>{privilege.name}</TableCell>
                                                                    <TableCell>{privilege.description}</TableCell>
                                                                </TableRow>
                                                            ));
                                                        }
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2 w-full">
                                <div className="w-full p-2">
                                    <RoleListScreen selectedRole={setRoleName} roles={roles} />
                                </div>
                            </div>
                        </div>
                        <InsertPrivilegeModal isOpen={isPrivilegeOpen} closeModal={closePrivilegeModal} role={roleName} />
                    </>

                )
            }
        </>
    );
}

export default RoleDashboard;