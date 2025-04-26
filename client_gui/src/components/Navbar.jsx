import { Flex, TextInput } from "@tremor/react"
import { SearchIcon } from "@heroicons/react/outline"
import { useDispatch, useSelector } from "react-redux"
import { signout } from "../api/store/actions/auth_service/auth.actions";
import { useCookies } from "react-cookie";
import { useCallback, useEffect, useRef, useState } from "react";
import { getScreenConfiguration } from "../api/store/actions/middleware_loader/microservices.actions";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [cookies, setCookies] = useCookies(['accessToken']);
    let auth = false;
    if (cookies.accessToken) {
        auth = true;
    }

    // List screen active
    const listScreen = useSelector((state) => state.screenList);
    const { loading, error, screens } = listScreen;

    const getListScreen = useCallback(() => {
        dispatch(getScreenConfiguration());
    }, [dispatch]);
    const debounceRef = useRef(null);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            getListScreen();
            localStorage.setItem("gaia-screens", JSON.stringify(screens));
        }, 200);
    }, [getListScreen]);

    const [query, setQuery] = useState("");
    const filterScreens = query === ''
        ? []
        : screens.filter((screen) =>
            screen.screenName.toLowerCase().includes(query.toLowerCase())
        );

    const signoutHandler = () => {
        dispatch(signout());
        navigate("/signin"); 
    }

    const wrapperRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setQuery("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div id="top" className="relative w-full sm:flex justify-between item-center p-2 mb-10">
            {/* Make item center */}
            <Flex justifyContent="center"></Flex>
                {loading ? (
                    <p>Loading</p>
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <div ref={wrapperRef} className="w-full">
                        <TextInput
                            icon={SearchIcon}
                            placeholder="Search Gaia Features"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && (
                            <div className="absolute z-10 bg-indigo-500 text-white border border-gray-300 w-full mt-1 rounded">
                                {filterScreens.length > 0 ? (
                                    filterScreens.map((screen) => (
                                        <div
                                            key={screen.id}
                                            className="p-2 hover:bg-indigo-200 cursor-pointer"
                                            onClick={() => {
                                                setQuery("");
                                                navigate(`${screen.screenUrl}`);
                                            }}
                                        >
                                            {screen.screenName}
                                        </div>
                                    ))
                                ) : (
                                    <p className="p-2 text-indigo-500">
                                        Screen not found
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
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