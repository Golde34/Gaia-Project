import { Dialog, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Input } from "@material-tailwind/react";
import { Col, DialogPanel, Grid } from "@tremor/react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import CheckBoxIcon from "../../components/icons/CheckboxIcon";
import { useDispatch, useSelector } from "react-redux";
import { getRoles } from "../../api/store/actions/auth_service/role.actions";
import { useUpdateUserDispatch } from "../../kernels/utils/write-dialog-api-requests";

const UpdateUserModal = (props) => {
    const dispatch = useDispatch();

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
    }, []);

    const currentUser = props.currentUser;
    const isOpen = props.isOpen;
    const closeModal = props.closeModal;

    const [name, setName] = useState("");
    const [isEditingName, setIsEditingName] = useState(false);

    const [username, setUsername] = useState("");
    const [isEditingUsername, setIsEditingUsername] = useState(false);

    const [email, setEmail] = useState("");
    const [isEditingEmail, setIsEditingEmail] = useState(false);

    const isStringEmpty = (str) => {
        return str === null || str === "" || str === undefined;
    }

    const [roleList, setRoleList] = useState([]);
    useEffect(() => {
        if (currentUser && currentUser.roles) {
            setRoleList(currentUser.roles);
        }
    }, [currentUser]);
    const handleRoleChange = (role) => {
        const roleExists = roleList.some((r) => r === role.name);

        if (roleExists) {
            setRoleList(roleList.filter((r) => r !== role.name));
        } else {
            setRoleList([...roleList, role.name]);
        }
    }

    const [updatedUser, setUpdatedUser] = useState({});
    const updateUser = useUpdateUserDispatch();
    const setObjectUser = (name, username, email, roleList) => {
        updatedUser.name = name === "" ? currentUser.name : name;
        updatedUser.username = username === "" ? currentUser.username : username;
        updatedUser.email = email === "" ? currentUser.email : email;
        updatedUser.roles = roleList;
        updateUser(updatedUser);
        window.location.reload();
    }

    return (
        <>
            {
                currentUser === null ? (
                    <></>
                ) : (
                    <Transition appear show={isOpen} as={Fragment} key={"transition_" + currentUser.id}>
                        <Dialog as="div" className="relative z-10" onClose={closeModal}>
                            <TransitionChild
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <div className="fixed inset-0 bg-black/25" />
                            </TransitionChild>

                            <div className="fixed inset-0 overflow-y-auto">
                                <div className="flex min-h-full items-center justify-center p-4 text-center">
                                    <TransitionChild
                                        as={Fragment}
                                        enter="ease-out duration-300"
                                        enterFrom="opacity-0 scale-95"
                                        enterTo="opacity-100 scale-100"
                                        leave="ease-in duration-200"
                                        leaveFrom="opacity-100 scale-100"
                                        leaveTo="opacity-0 scale-95"
                                    >
                                        <DialogPanel className="w-full max-w-md transform overflow-auto rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                            <DialogTitle
                                                as="h1"
                                                className="text-lg font-medium leading-6 text-gray-900" >
                                                <span className="text-lg cursor-pointer" >User</span>
                                            </DialogTitle>
                                            <div className="mt-4">
                                                <Grid numItems={4}>
                                                    <Col numColSpan={1}>
                                                        <label htmlFor="name" className="block text-md font-medium text-gray-700 mb-2">Name</label>
                                                    </Col>
                                                    <Col numColSpan={3}>
                                                        {isEditingName ? (
                                                            <Input
                                                                type="text"
                                                                className="border-2 border-gray-200 p-2 rounded-md w-full"
                                                                value={name}
                                                                onChange={(e) => {setName(e.target.value)}}
                                                                onBlur={() => {setIsEditingName(!isEditingName)}}
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <h1
                                                                className="text-sm cursor-pointer"
                                                                onClick={() => {setIsEditingName(!isEditingName)}}
                                                            >
                                                                {isStringEmpty(name) ? currentUser.name : name}
                                                            </h1>
                                                        )}
                                                    </Col>
                                                </Grid>
                                            </div>
                                            <div className="mt-4">
                                                <Grid numItems={4}>
                                                    <Col numColSpan={1}>
                                                        <label htmlFor="username" className="block text-md font-medium text-gray-700 mb-2">Username</label>
                                                    </Col>
                                                    <Col numColSpan={3}>
                                                        {isEditingUsername ? (
                                                            <Input
                                                                type="text"
                                                                className="border-2 border-gray-200 p-2 rounded-md w-full"
                                                                value={username}
                                                                onChange={(e) => {setUsername(e.target.value)}}
                                                                onBlur={() => {setIsEditingUsername(!isEditingUsername)}}
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <h1
                                                                className="text-sm cursor-pointer"
                                                                onClick={() => {setIsEditingUsername(!isEditingUsername)}}
                                                            >
                                                                {isStringEmpty(username) ? currentUser.username : username}
                                                            </h1>

                                                        )}
                                                    </Col>
                                                </Grid>
                                            </div>
                                            <div className="mt-4">
                                                <Grid numItems={4}>
                                                    <Col numColSpan={1}>
                                                        <label htmlFor="email" className="block text-md font-medium text-gray-700 mb-2">Email</label>
                                                    </Col>
                                                    <Col numColSpan={3}>
                                                        {isEditingEmail ? (
                                                            <Input
                                                                type="text"
                                                                className="border-2 border-gray-200 p-2 rounded-md w-full"
                                                                value={email}
                                                                onChange={(e) => {setEmail(e.target.value)}}
                                                                onBlur={() => {setIsEditingEmail(!isEditingEmail)}}
                                                                autoFocus
                                                            />
                                                        ) : (
                                                            <h1
                                                                className="text-sm cursor-pointer"
                                                                onClick={() => {setIsEditingEmail(!isEditingEmail)}}
                                                            >
                                                                {isStringEmpty(email) ? currentUser.email : email}
                                                            </h1>

                                                        )}
                                                    </Col>
                                                </Grid>
                                            </div>
                                            {loading ? (
                                                <p>Loading </p>
                                            ) : (
                                                <>
                                                    <div className="mt-4">
                                                        <p className="block text-md font-medium text-gray-700 mb-3">Role</p>
                                                        <div className="grid grid-cols-4 m-2">
                                                            <div className="inline-flex items-center">
                                                                {roles.map((role) => (
                                                                    <div key={role.id}>
                                                                        <label className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                                            htmlFor={`role-checkbox-${role.id}`} data-ripple-dark="true">
                                                                            <input
                                                                                id={`role-checkbox-${role.id}`}
                                                                                type="checkbox"
                                                                                checked={roleList.some((r) => r === role.name)}
                                                                                onChange={() => handleRoleChange(role)}
                                                                                className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-red-500 checked:bg-red-500 checked:before:bg-red-500 hover:before:opacity-10"
                                                                            />
                                                                            <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                                                                <CheckBoxIcon />
                                                                            </div>
                                                                        </label>
                                                                        <label className="text-sm text-gray-700">{role.name}</label>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            )
                                            }

                                            <div className="mt-4 flex justify-end">
                                                <button
                                                    type="button"
                                                    className="mr-2 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    onClick={() => {
                                                        setObjectUser(name, username, email, roleList);
                                                        closeModal();
                                                    }}
                                                >Edit</button>
                                            </div>

                                        </DialogPanel>
                                    </TransitionChild>
                                </div>
                            </div>
                        </Dialog>
                    </Transition >
                )
            }
        </>
    )
}

export default UpdateUserModal;
