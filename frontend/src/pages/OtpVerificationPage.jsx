import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./OtpVerificationPage.css";

const OtpVerificationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { register } = useAuth();
    const email = new URLSearchParams(location.search).get("email");
    const purpose = new URLSearchParams(location.search).get("purpose") || "registration";

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(60);
    const [resendCount, setResendCount] = useState(0);

    const isPasswordReset = purpose === "reset-password";

    useEffect(() => {
        if (isPasswordReset) {
            if (!sessionStorage.getItem("passwordResetEmail") && !email) {
                navigate("/forgot-password");
            }
        } else {
            if (!sessionStorage.getItem("registrationId")) {
                navigate("/register");
            }
        }
    }, [navigate, isPasswordReset, email]);

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

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

        try {
            if (isPasswordReset) {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/otp/verify`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        otp,
                        purpose: "reset-password"
                    }),
                });

                if (res.ok) {
                    setMessage("OTP verified! Redirecting to password recovery page...");
                    setTimeout(() => {
                        navigate(`/reset-password?email=${encodeURIComponent(email)}&verified=true`);
                    }, 2000);
                } else {
                    const errorData = await res.json();
                    setError(errorData.message || "Invalid or expired OTP.");
                }
            } else {
                // Handle registration completion
                const registrationId = sessionStorage.getItem("registrationId");
                
                if (!registrationId) {
                    setError("Registration session not found. Please register again.");
                    setTimeout(() => navigate("/register"), 2000);
                    return;
                }

                const result = await register(registrationId, otp);
                
                if (result.success) {
                    sessionStorage.removeItem("registrationId");
                    setMessage("Registration successful! Redirecting...");
                    setTimeout(() => navigate("/dashboard"), 2000);
                } else {
                    setError(result.message || "Registration failed.");
                }
            }
        } catch (err) {
            console.error("Error during verification:", err);
            setError(err.message || "Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setResendLoading(true);
            setError("");
            
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/otp/request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    purpose: isPasswordReset ? "reset-password" : "registration"
                }),
            });

            if (res.ok) {
                setMessage("OTP sent successfully!");
                setResendCount(prev => prev + 1);
                setTimer(60);
            } else {
                const data = await res.json();

                if (res.status === 429) {
                    setError(data.error || "Please wait before requesting another OTP.");
                } else {
                    setError(data.message || "Failed to resend OTP.");
                }
            }
        } catch (err) {
            console.error("Resend error:", err);
            setError("Failed to resend OTP. Please try again.");
        } finally {
            setResendLoading(false);
        }
    };

    const isResendDisabled = resendCount >= 3 || timer > 0 || resendLoading;

    const getPageTitle = () => {
        return "Verify your email";
    };

    return (
        <div className="otp-verification-container">
            <div className="otp-verification-form">
                <h2>{getPageTitle()}</h2>
                <p className="otp-description">
                    We've sent a 6-digit verification code to <strong>{email}</strong>
                </p>

                <form onSubmit={handleVerify}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Enter"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            disabled={loading}
                            maxLength="6"
                            className="otp-input"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="verify-btn"
                    >
                        {loading ? "Verifying..." : "Verify OTP"}
                    </button>
                </form>

                <div className="resend-section">
                    {resendCount < 3 ? (
                        <button
                            className="resend-btn"
                            onClick={handleResend}
                            disabled={isResendDisabled}
                        >
                            {resendLoading
                                ? "Sending..."
                                : (timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP")}
                        </button>
                    ) : (
                        <div className="max-resend">
                            Maximum resend attempts reached. Please try again later.
                        </div>
                    )}
                </div>

                <div className="message-area">
                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="success-message">{message}</div>}
                </div>

                <div className="back-link">
                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="back-btn"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OtpVerificationPage;