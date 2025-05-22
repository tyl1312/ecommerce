import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = ({ captchaToken }) => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [Identifier, setIdentifier] = useState("");
    const [Password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        if (!Identifier || !Password) {
            setError("Please enter your email/phone and password.");
            setLoading(false);
            return;
        }
        if (!captchaToken) {
            setError("Please complete the captcha.");
            setLoading(false);
            return;
        }
        const result = await login(Identifier, Password, captchaToken); // <-- pass captchaToken
        if (result.success) {
            navigate("/");
        } else {
            setError(result.message || "Login failed");
        }
        setLoading(false);
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <input
                    type="text"
                    name="identifier"
                    placeholder="Email or Phone Number"
                    required
                    value={Identifier}
                    onChange={e => setIdentifier(e.target.value)}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                    value={Password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>
            <button className="submit-btn" type="submit" disabled={loading || !captchaToken}>
                Login
            </button>
            {error && <div className="error-message">{error}</div>}
        </form>
    );
};

export default Login;