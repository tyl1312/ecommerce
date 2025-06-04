import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ResetPasswordPage.css";

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = new URLSearchParams(location.search).get("email");
    const verified = new URLSearchParams(location.search).get("verified");
    
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!verified || !email || !sessionStorage.getItem("passwordResetEmail")) {
            navigate("/forgot-password");
        }
    }, [navigate, verified, email]);

    useEffect(() => {
        if (!error) return;
        const timeout = setTimeout(() => setError(""), 5000);
        return () => clearTimeout(timeout);
    }, [error]);

    useEffect(() => {
        if (!message) return;
        const timeout = setTimeout(() => setMessage(""), 5000);
        return () => clearTimeout(timeout);
    }, [message]);

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; 
        return passwordRegex.test(password);
    };

    const passwordValidation = validatePassword(password);
    const passwordsMatch = password === confirmPassword;
    const isFormValid = passwordValidation && passwordsMatch && password && confirmPassword;

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!isFormValid) {
            setError("Please ensure all requirements are met.");
            return;
        }

        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email, 
                    password,
                }),
            });

            const data = await res.json();
            setLoading(false);

            if (res.ok) {
                sessionStorage.removeItem("passwordResetEmail");
                setMessage("Password reset successful! Redirecting to login...");
                
                setTimeout(() => {
                    navigate("/login?message=Password reset successful. Please log in with your new password.");
                }, 3000);
            } else {
                if (res.status === 400) {
                    setError(data.message || "Invalid request. Please try again.");
                } else if (res.status === 401) {
                    setError("Session expired. Please restart the password reset process.");
                    setTimeout(() => navigate("/forgot-password"), 3000);
                } else {
                    setError(data.message || "Failed to reset password. Please try again.");
                }
            }
        } catch (err) {
            setLoading(false);
            setError("Password reset failed.");
        }
    };

    return (
        <div className="reset-password-container">
            <div className="reset-password-form">
                <h2>Set New Password</h2>
                <p className="reset-password-description">
                    Create a new password for your account: <strong>{email}</strong>
                </p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="password-input-container">
                            <input
                                type={"password"}
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                                className={password && !passwordValidation? "error" : ""}
                            />
                        </div>

                    </div>

                    <div className="form-group">
                        <div className="password-input-container">
                            <input
                                type={"password"}
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={loading}
                                className={confirmPassword && !passwordsMatch ? "error" : ""}
                            />
                        </div>
                        
                        {confirmPassword && !passwordsMatch && (
                            <div className="password-match-error">
                                Passwords do not match
                            </div>
                        )}
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading || !isFormValid}
                        className="submit-btn"
                    >
                        {loading ? "Resetting Password..." : "Reset Password"}
                    </button>
                </form>

                <div className="message-area">
                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="success-message">{message}</div>}
                </div>

                <div className="back-to-login">
                    <button 
                        type="button" 
                        onClick={() => navigate("/login")}
                        className="back-btn"
                        disabled={loading}
                    >
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordPage;