import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useRef, useState } from "react";
import { getUsers } from "../../../api/store/actions/auth_service/user.actions";
import { Card, Flex, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Title } from "@tremor/react";
import UpdateUserModal from "../UpdateUserModal";

const UserListScreen = (props) => {
    const dispatch = useDispatch();
    const searchText = props.searchText;
    // List Users
    const listUsers = useSelector((state) => state.userList);
    const { loading, error, users } = listUsers;

    const getListUsers = useCallback(() => {
        dispatch(getUsers());
    }, [dispatch]);

    const debounceRef = useRef(null);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            getListUsers();
        }, 200);
        return () => clearTimeout(debounceRef.current);
    }, [getListUsers]);

    // Topup edit user
    let [isOpen, setIsOpen] = useState(false);
    let [currentUser, setCurrentUser] = useState(null);

    function closeModal() {
        setIsOpen(false)
    }
    function openModal(user) {
        setIsOpen(true)
        setCurrentUser(user)
    }

    return (
        <>
            {loading ? (
                <p>Loading</p>
            ) : error ? (
                <p>{error}</p>
            ) : (
                <>
                    <Card>
                        <Flex>
                            <Title>List of Users</Title>
                            <Title>{searchText}</Title>
                            <button
                                type="button"
                                className="m-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                onClick={() => {
                                    closeModal();
                                }}
                            >
                                Add User
                            </button>
                        </Flex>
                        <Table className="mt-5">
                            <TableHead>
                                <TableRow>
                                    <TableHeaderCell><Title>Id</Title></TableHeaderCell>
                                    <TableHeaderCell><Title>Name</Title></TableHeaderCell>
                                    <TableHeaderCell><Title>Username</Title></TableHeaderCell>
                                    <TableHeaderCell><Title>Role</Title></TableHeaderCell>
                                    <TableHeaderCell><Title>Last Login</Title></TableHeaderCell>
                                    <TableHeaderCell><Title>Edit User</Title></TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.length > 0 ? users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.id}</TableCell>
                                        <TableCell>{user.name}</TableCell>
                                        <TableCell>{user.username}</TableCell>
                                        <TableCell>{user.roles.map((role) => role + " ")}</TableCell>
                                        <TableCell>{user.lastLogin}</TableCell>
                                        <TableCell>
                                            <button
                                                type="button"
                                                className="m-2 inline-flex justify-center rounded-md border border-transparent bg-yellow-100 px-4 py-2 text-sm font-medium text-yellow-900 hover:bg-yellow-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                                onClick={() => {
                                                    openModal(user);
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"

                                            >Delete</button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6}>No users found</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                    <UpdateUserModal currentUser={currentUser} isOpen={isOpen} closeModal={closeModal} />
                </>
            )
            }
        </>
    )
}

export default UserListScreen;