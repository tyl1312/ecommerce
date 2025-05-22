import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthCallback = () => {
    const navigate = useNavigate();
    const { setUser, setToken } = useAuth();

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const code = query.get("code");
        const captchaToken = sessionStorage.getItem("captchaToken");

        if (code && captchaToken) {
            fetch("/api/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, captchaToken }),
                credentials: "include"
            })
                .then(res => res.json())
                .then(data => {
                    if (data.accessToken && data.user) {
                        localStorage.setItem("accessToken", data.accessToken);
                        setToken(data.accessToken);
                        setUser(data.user);
                        sessionStorage.removeItem("captchaToken");
                        navigate("/");
                    } else {
                        // Handle error (show message, redirect, etc.)
                        navigate("/login");
                    }
                })
                .catch(() => navigate("/login"));
        } else {
            navigate("/login");
        }
    }, [navigate, setUser, setToken]);
};

export default AuthCallback;