import { Flex, TextInput } from "@tremor/react"
import { SearchIcon } from "@heroicons/react/outline"
import { useDispatch } from "react-redux"
import { signout } from "../api/store/actions/auth_service/auth.actions";
import { useCookies } from "react-cookie";

const Navbar = () => {
    const dispatch = useDispatch();
    const [cookies, setCookies] = useCookies(['accessToken']);
    let auth = false;
    if (cookies.accessToken) {
        auth = true;
    }

    const signoutHandler = () => {
        dispatch(signout());
    }

    return (
        <div id="top"
            className="relative w-full sm:flex justify-between item-center p-2"
        >
            {/* Make item center */}
            <Flex justifyContent="center"></Flex>
            <TextInput icon={SearchIcon} placeholder="Search Gaia Feature" />
            {/* Make item end */}
            <Flex justifyContent="end">

                {!auth ? (
                    <div className="flex">
                        <a href="/client-gui/signin">
                            <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded me-3">
                                Sign In
                            </button>
                        </a>
                        <a href="/client-gui/signup">
                            <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">
                                Sign Up
                            </button>
                        </a>
                    </div>
                ) : (
                    <div className="flex">
                        <a href="#">
                            <button className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                                onClick={signoutHandler}>
                                Sign Out
                            </button>
                        </a>
                    </div>
                )}

            </Flex>
        </div>
    )
}

export default Navbar;