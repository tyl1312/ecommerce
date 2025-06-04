import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AuthCallback = () => {
    const navigate = useNavigate();
    const { setUser, setToken } = useAuth();

    useEffect(() => {
        const doAuth = async () => {
            const query = new URLSearchParams(window.location.search);
            const code = query.get("code");
            const state = query.get("state");
            const storedState = sessionStorage.getItem("oauthState");

            if (!code || !state || state !== storedState) {
                navigate("/login");
                return;
            }

            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code }),
                    credentials: "include"
                });

                const data = await res.json();
                if (data.accessToken && data.user) {
                    localStorage.setItem("accessToken", data.accessToken);
                    setToken(data.accessToken);
                    setUser(data.user);
                    sessionStorage.removeItem("oauthState");
                    navigate("/dashboard");
                } else {
                    navigate("/login");
                }
            } catch (err) {
                console.error("Login failed", err);
                navigate("/login");
            }
        };

        doAuth();
    }, [navigate, setUser, setToken]);
    return <p>Logging in with Google...</p>;
};

export default AuthCallback;