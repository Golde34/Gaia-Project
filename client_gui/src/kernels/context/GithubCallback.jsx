import { useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { config } from "../configs/configuration";

function GitHubCallback() {
    const location = useLocation();
    const navigate = useNavigate();

    const middlewarePort = config.middlewarePort;
    const url = `http://${config.serverHost}:${middlewarePort}/user-commit/user-github/authorize`;

    const debounceRef = useRef(null);

    const sendAuthorizationCode = useCallback(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get("code");
        const state = params.get("state");

        if (code) {
            axios
                .post(url, { code, state })
                .then((response) => {
                    navigate("/profile");
                })
                .catch((error) => {
                    console.error("GitHub Integration Failed:", error);
                });
        }
    }, [location.search, navigate]);

    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            sendAuthorizationCode();
        }, 200);
        return () => clearTimeout(debounceRef.current);
    }, [sendAuthorizationCode]);

    return (
        <div className="text-center">
            <p>Processing GitHub Integration...</p>
        </div>
    );
}

export default GitHubCallback;
