import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = ({ captchaToken, onRegisterSuccess, onRegisterFailure }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!email || !username || !password || !confirmPassword) {
            setError("Please fill in all fields.");
            setLoading(false);
            // Reset captcha on validation failure
            if (onRegisterFailure) onRegisterFailure();
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords don't match.");
            setLoading(false);
            // Reset captcha on validation failure
            if (onRegisterFailure) onRegisterFailure();
            return;
        }

        if (!captchaToken) {
            setError("Please complete the captcha.");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register-pending`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email,
                    username,
                    password,
                    captchaToken
                }),
            });

            if (res.ok) {
                const data = await res.json();
                sessionStorage.setItem("registrationId", data.registrationId);
                navigate(`/otp/verify?email=${encodeURIComponent(email)}&purpose=registration`);
                // Call success handler
                if (onRegisterSuccess) onRegisterSuccess();
            } else {
                const data = await res.json();

                if (res.status === 429) {
                    setError(data.error || "Too many attempts. Please try again later.");
                } else {
                    setError(data.message || "Registration failed.");
                }
                
                // Reset captcha on registration failure
                if (onRegisterFailure) onRegisterFailure();
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError("Registration failed. Please try again.");
            // Reset captcha on network/other errors
            if (onRegisterFailure) onRegisterFailure();
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                />
            </div>
            <button className="submit-btn" type="submit" disabled={loading || !captchaToken}>
                {loading ? "Redirecting..." : "Create account"}
            </button>
            {error && <div className="error-message">{error}</div>}
        </form>
    );
};

export default Register;