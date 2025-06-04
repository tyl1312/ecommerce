import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./ForgotPasswordPage.css";

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    // Reset error and message after 5 seconds
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/otp/request`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email,
                    purpose: 'reset-password'
                }),
            });

            const data = await res.json();
            setLoading(false);

            if (res.ok) {
                sessionStorage.setItem("passwordResetEmail", email);
                setMessage("OTP sent to your email. Redirecting...");
                
                setTimeout(() => {
                    navigate(`/otp/verify?email=${encodeURIComponent(email)}&purpose=reset-password`);
                }, 2000);
            } else {
                if (res.status === 404) {
                    setError("Email not found. Please check your email address.");
                } else if (res.status === 429) {
                    setError("Too many attempts. Please try again later.");
                } else {
                    setError(data.message || "Failed to send OTP. Please try again.");
                }
            }
        } catch (err) {
            setLoading(false);
            setError("Network error. Please check your connection and try again.");
        }
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isFormValid = email.trim() && validateEmail(email);

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-form">
                <h2>Reset Your Password</h2>
                <p className="forgot-password-description">
                    Enter your email address and we'll send you an OTP to reset your password.
                </p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                            className={error ? "error" : ""}
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading || !isFormValid}
                        className="submit-btn"
                    >
                        {loading ? "Sending..." : "Send OTP"}
                    </button>
                </form>

                <div className="message-area">
                    {error && <div className="error-message">{error}</div>}
                    {message && <div className="success-message">{message}</div>}
                </div>

                <div className="back-to-login">
                    <Link to="/login">← Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;