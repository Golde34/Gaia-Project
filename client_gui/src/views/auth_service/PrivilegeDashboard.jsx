import { Card, Flex, Metric, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Title } from "@tremor/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getPrivileges } from "../../api/store/actions/auth_service/privilege.actions";
import PrivilegeListScreen from "../../screens/roleScreen/PrivilegeListScreen";
import InsertPrivilegeModal from "../../screens/roleScreen/InsertPrivilegeModal";

function PrivilegeDashboard() {
    const dispatch = useDispatch();

    const [privilegeName, setPrivilegeName] = useState();

    const listPrivilege = useSelector((state) => state.privilegeList);
    const { loading, error, privileges } = listPrivilege;
 
    const getPrivilegeList = useCallback(() => {
        dispatch(getPrivileges());
    }, [dispatch]);

    const debounceRef = useRef(null);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            getPrivilegeList();
        }, 200);
        return () => clearTimeout(debounceRef.current);
    }, [getPrivilegeList]);

    let [isOpen, setIsOpen] = useState(false);
    function closeModal() {
        setIsOpen(false)
    }
    function openModal() {
        setIsOpen(true)
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
                            className="text-2xl font-bold text-gray-800"> Privilege Dashboard
                        </Metric>
                        <div className="grid md:grid-cols-5 grid-cols-1 w-full">
                            <div className="col-span-3">
                                <div className="w-full flex flex-col justify-between p-2">
                                    <div className="flex-auto w-full">
                                        <PrivilegeListScreen selectedPrivilege={setPrivilegeName} privileges={privileges} />
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2 w-full">
                                <div className="w-full p-2">
                                    <Card>
                                        <Flex>
                                            <Title>Roles</Title>
                                            <button
                                                type="button"
                                                className="m-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                                onClick={() => {
                                                    openModal();
                                                }}
                                            > Insert Privilege
                                            </button>
                                        </Flex>
                                        <Title>{privilegeName}</Title>
                                        <Table className="mt-5">
                                            <TableHead>
                                                <TableRow>
                                                    <TableHeaderCell>Role</TableHeaderCell>
                                                    <TableHeaderCell>Description</TableHeaderCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {privileges.map((p) => {
                                                    if (p.name === privilegeName) {
                                                        return p.roles.map((r) => (
                                                            <TableRow key={r.id}>
                                                                <TableCell>{r.name}</TableCell>
                                                                <TableCell>{r.description}</TableCell>
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
                        <InsertPrivilegeModal isOpen={isOpen} closeModal={closeModal} />
                    </>
                )
            }
        </>
    )
}

export default PrivilegeDashboard;