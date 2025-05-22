import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import Login from "./Login";
import Register from "./Register";
import { useAuth } from "../context/AuthContext";
import "./AuthPage.css";

const RECAPTCHA_KEY = import.meta.env.VITE_SITE_KEY;

const AuthPage = ({ mode }) => {
    const navigate = useNavigate();
    const isLogin = mode === "login";
    const { loginWithGoogle } = useAuth();
    const [captchaToken, setCaptchaToken] = useState("");

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
                            onClick={() => navigate("/register")}
                            type="button"
                        >
                            Register
                        </button>
                    </div>
                    {isLogin ? <Login captchaToken={captchaToken} /> : <Register captchaToken={captchaToken} />}
                    <div className="divider">
                        <span>or continue with</span>
                    </div>
                    <div className="social-row">
                        <button 
                            className="social-btn google" 
                            onClick={() => captchaToken && loginWithGoogle(captchaToken)}
                            disabled={!captchaToken}
                        >
                            Google
                        </button>
                    </div>

                    <div className="captcha-container">
                        <ReCAPTCHA
                            sitekey={RECAPTCHA_KEY}
                            onChange={setCaptchaToken}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;