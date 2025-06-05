import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = ({ captchaToken, onLoginFailure, onLoginSuccess, requiresCaptcha }) => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!identifier || !password) {
            setError("Please enter your email/username and password.");
            setLoading(false);
            onLoginFailure?.();
            return;
        }

        if (requiresCaptcha && !captchaToken) {
            setError("Please complete the captcha verification.");
            setLoading(false);
            onLoginFailure?.();
            return;
        }

        try {
            const result = await login(identifier, password, captchaToken, requiresCaptcha);
            
            if (result.success) {
                onLoginSuccess?.();
                
                // Check user role and navigate accordingly
                if (result.user && result.user.role === "admin") {
                    navigate("/adminPanel"); 
                } else {
                    navigate("/dashboard"); 
                }
            } else {
                setError(result.message || "Login failed");
                onLoginFailure?.();
            }
        } catch (error) {
            setError("Network error. Please try again.");
            onLoginFailure?.();
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <input
                    type="text"
                    name="identifier"
                    placeholder="Email or Username"
                    required
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>

            <div className="forgot-password">
                <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            {requiresCaptcha && !captchaToken && (
                <div className="captcha-required-message">
                    Please complete the reCAPTCHA verification below
                </div>
            )}

            <button 
                className="submit-btn" 
                type="submit" 
                disabled={loading || (requiresCaptcha && !captchaToken)}
            >
                {loading ? "Logging in..." : "Login"}
            </button>
            
            {error && <div className="error-message">{error}</div>}
        </form>
    );
};

export default Login;