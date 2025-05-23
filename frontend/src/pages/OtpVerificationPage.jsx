import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./OtpVerificationPage.css";

const OtpVerificationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser, setToken } = useAuth();
    const email = new URLSearchParams(location.search).get("email");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [resendCount, setResendCount] = useState(0);

    useEffect(() => {
        if (!sessionStorage.getItem("pendingRegistration")) {
            navigate("/register");
        }
    }, [navigate]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    //reset message after 5 seconds
    useEffect(() => {
        if (!message) return;
        const timeout = setTimeout(() => setMessage(""), 5000);
        return () => clearTimeout(timeout);
    }, [message]);


    useEffect(() => {
        if (!error) return;
        const timeout = setTimeout(() => setError(""), 5000);
        return () => clearTimeout(timeout);
    }, [error]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");
        const res = await fetch("/api/verify-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp }),
        });
        if (res.ok) {
            const regData = JSON.parse(sessionStorage.getItem("pendingRegistration"));
            const regRes = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(regData),
                credentials: "include"
            });
            setLoading(false);
            if (regRes.ok) {
                const data = await regRes.json();
                if (data.accessToken && data.user) {
                    localStorage.setItem('accessToken', data.accessToken);
                    setToken(data.accessToken);
                    setUser(data.user);
                }
                sessionStorage.removeItem("pendingRegistration");
                navigate("/");
            } else {
                setError("Registration failed.");
            }
        } else {
            setLoading(false);
            setError("Invalid or expired OTP.");
        }
    };

    const handleResend = async () => {
        if (resendCount >= 3) return;
        setResendLoading(true);
        setError("");
        setMessage("");
        const res = await fetch("/api/request-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        setResendLoading(false);
        if (res.ok) {
            setMessage("OTP resent to your email.");
            setTimer(60);
            setResendCount(count => count + 1);
        } else {
            setError("Failed to resend OTP.");
        }
    };

    return (
        <div className="otp-verification-form">
            <h2>Verify your email</h2>
            <form onSubmit={handleVerify}>
                <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading? "Redirecting..." : "Enter"}
                </button>
            </form>
            {resendCount < 3 ? (
                <button
                    className="resend-btn"
                    onClick={handleResend}
                    disabled={timer > 0 || resendLoading}
                >
                    {resendLoading
                        ? "Sending..."
                        : (timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP")}
                </button>
            ) : (
                <div className="max-resend">
                    Maximum resend attempts reached
                </div>
            )}
            <div className="message-area">
                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}
            </div>
        </div>
    );
};

export default OtpVerificationPage;