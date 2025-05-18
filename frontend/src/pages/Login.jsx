import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Login.css";

const Login = () => {
    const { mode } = useParams();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(mode === "login");

    // Separate state for login and signup fields
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");

    useEffect(() => {
        setIsLogin(mode === "login");
        // Optionally clear fields when switching
        setLoginEmail("");
        setLoginPassword("");
        setSignupEmail("");
        setSignupPassword("");
        setFirstname("");
        setLastname("");
    }, [mode]);

    return (
        <div className="split-container">
            <div className="split-left">
                <img
                    src="/buyer_dweb_individual.jpg"
                    alt="Welcome"
                    className="split-image"
                />
            </div>
            <div className="split-right">
                <div className="form-box">
                    <h2 className="form-title">{isLogin ? "Login to your account" : "Create an account"}</h2>
                    <div className="toggle-row">
                        <button
                            className={`toggle-btn ${isLogin ? "active" : ""}`}
                            onClick={() => navigate("/login")}
                            type="button"
                        >
                            Login
                        </button>
                        <button
                            className={`toggle-btn ${!isLogin ? "active" : ""}`}
                            onClick={() => navigate("/signup")}
                            type="button"
                        >
                            Sign Up
                        </button>
                    </div>
                    <form className="login-form">
                        {!isLogin && (
                            <div className="form-group double">
                                <input
                                    className="first_name_input"
                                    type="text"
                                    name="firstname"
                                    placeholder="First name"
                                    required
                                    value={firstname}
                                    onChange={e => setFirstname(e.target.value)}
                                />
                                <input
                                    className="last_name_input"
                                    type="text"
                                    name="lastname"
                                    placeholder="Last name"
                                    required
                                    value={lastname}
                                    onChange={e => setLastname(e.target.value)}
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                required
                                value={isLogin ? loginEmail : signupEmail}
                                onChange={e =>
                                    isLogin
                                        ? setLoginEmail(e.target.value)
                                        : setSignupEmail(e.target.value)
                                }
                            />
                        </div>
                        <div className="form-group">
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                required
                                value={isLogin ? loginPassword : signupPassword}
                                onChange={e =>
                                    isLogin
                                        ? setLoginPassword(e.target.value)
                                        : setSignupPassword(e.target.value)
                                }
                            />
                        </div>
                        <button className="submit-btn" type="submit">
                            {isLogin ? "Login" : "Create account"}
                        </button>
                    </form>
                    <div className="divider">
                        <span>or continue with</span>
                    </div>
                    <div className="social-row">
                        <button className="social-btn google">Google</button>
                        <button className="social-btn facebook">Facebook</button>
                        <button className="social-btn apple">Apple</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;