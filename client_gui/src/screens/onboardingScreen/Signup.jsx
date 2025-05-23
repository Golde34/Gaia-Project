import { Button, Card, Col, Flex, Grid, Metric, Title } from "@tremor/react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom";
import "../../assets/husky.scss";
import MessageBox from "../../components/subComponents/MessageBox";
import { signup } from "../../api/store/actions/auth_service/auth.actions";

const Signup = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userSignup = useSelector(state => state.userSignup);
    const { userInfo, loading, error } = userSignup;

    const [errorMessage, setErrorMessage] = useState('');

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [matchingPassword, setMatchingPassword] = useState('');

    const submitHandler = (e) => {
        e.preventDefault();
        if (password !== matchingPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }
        dispatch(signup(email, name, username, password, matchingPassword));
    }

    return (
        <>
            <Grid numItems={12} className="w-full">
                <Col numColSpan={12}>
                    <Metric level={3} className="text-center mb-5">Sign up</Metric>
                    <Flex justifyContent="end">
                        <Card className="max-w-lg mx-auto">
                            <form onSubmit={submitHandler}>
                                {loading && <div>Loading...</div>}
                                {error &&
                                    <div>
                                        <MessageBox message={error} />
                                    </div>
                                }

                                <div className="mt-2">
                                    <label htmlFor="username" className="block text-md font-medium text-gray-700 mb-3">
                                        <Title>Username</Title>
                                    </label>
                                    <input
                                        id="username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="mt-1 block w-full h-10 p-4 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Username"
                                    />
                                </div>
                                <div className="mt-4 mb-4">
                                    <label htmlFor="name" className="block text-md font-medium text-gray-700 mb-3">
                                        <Title>Name</Title>
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="mt-1 block w-full h-10 p-4 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Name"
                                    />
                                </div>
                                <div className="mt-4 mb-4">
                                    <label htmlFor="email" className="block text-md font-medium text-gray-700 mb-3">
                                        <Title>Email</Title>
                                    </label>
                                    <input
                                        id="email"
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 block w-full h-10 p-4 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Email"
                                    />
                                </div>
                                <div className="mt-4 mb-4">
                                    <label htmlFor="password" className="block text-md font-medium text-gray-700 mb-3">
                                        <Title>Password</Title>
                                    </label>
                                    <input
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-1 block w-full rounded-md h-10 p-4 border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Password"
                                        type="text"
                                    />
                                </div>
                                <div className="mt-4 mb-4">
                                    <label htmlFor="matchingPassword" className="block text-md font-medium text-gray-700 mb-3">
                                        <Title>Confirm Password</Title>
                                    </label>
                                    <input
                                        id="matchingPassword"
                                        value={matchingPassword}
                                        onChange={(e) => setMatchingPassword(e.target.value)}
                                        className="mt-1 block w-full rounded-md h-10 p-4 border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="Confirm Password"
                                        type="password"
                                    />
                                </div>

                                {errorMessage === '' || errorMessage === null ? '' :
                                    <div>
                                        <MessageBox message={errorMessage} />
                                    </div>
                                }
                                <div className="mt-4 relative">
                                    {userInfo && (
                                        <button
                                            type="button"
                                            className="absolute right-0 top-0 z-10 inline-flex rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                            onClick={() => navigate('/onboarding/task-register')}
                                        >
                                            Continue
                                        </button>
                                    )}
                                    <div className="flex justify-center">
                                        <button
                                            type="submit"
                                            className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                                            disabled={loading}
                                        >
                                            {loading ? 'Signing up...' : 'Sign up'}
                                        </button>
                                    </div>
                                </div>

                            </form>
                        </Card>
                    </Flex>
                </Col>
            </Grid>
        </>
    )
}

export default Signup;