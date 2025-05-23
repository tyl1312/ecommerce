import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = ({ captchaToken }) => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [first_name, setFirstname] = useState("");
    const [last_name, setLastname] = useState("");
    const [email, setEmail] = useState("");
    const [phone_number, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [home_address, setAddress] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (!first_name || !last_name || !email || !phone_number || !password || !home_address) {
            setError("Please fill in all fields.");
            setLoading(false);
            return;
        }
        if (!captchaToken) {
            setError("Please complete the captcha.");
            setLoading(false);
            return;
        }

        const res = await fetch("/api/request-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
        });
        setLoading(false);
        if (res.ok) {
            sessionStorage.setItem("pendingRegistration", JSON.stringify({
                email, phone_number, password, first_name, last_name, home_address, captchaToken
            }));
            navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
        } else {
            setError("Failed to send OTP.");
        }
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group double">
                <input
                    className="first_name_input"
                    type="text"
                    name="first_name"
                    placeholder="First name"
                    required
                    value={first_name}
                    onChange={e => setFirstname(e.target.value)}
                />
                <input
                    className="last_name_input"
                    type="text"
                    name="last_name"
                    placeholder="Last name"
                    required
                    value={last_name}
                    onChange={e => setLastname(e.target.value)}
                />
            </div>
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
                    name="phone"
                    placeholder="Phone Number"
                    required
                    value={phone_number}
                    onChange={e => setPhone(e.target.value)}
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
                    type="text"
                    name="home_address"
                    placeholder="Home Address"
                    required
                    value={home_address}
                    onChange={e => setAddress(e.target.value)}
                />
            </div>
            <button className="submit-btn" type="submit" disabled={loading || !captchaToken}>
                Create account
            </button>
            {error && <div className="error-message">{error}</div>}
        </form>
    );
};

export default Register;