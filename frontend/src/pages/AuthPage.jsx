import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
    const [showRecaptcha, setShowRecaptcha] = useState(false);
    const [failedAttempts, setFailedAttempts] = useState(0);

    //Check failed login attempts
    useEffect(() => {
        const storedAttempts = parseInt(sessionStorage.getItem('failedLoginAttempts') || '0');
        if (isLogin) {
            if (storedAttempts >= 3) {
                setShowRecaptcha(true);
                setFailedAttempts(storedAttempts);
            } else {
                setShowRecaptcha(false);
                setFailedAttempts(storedAttempts);
            }
        } else {
            //Captcha for registration
            setShowRecaptcha(true);
        }
    }, [isLogin]);

    const handleLoginFailure = () => {
        const newAttempts = failedAttempts + 1;
        setFailedAttempts(newAttempts);
        sessionStorage.setItem('failedLoginAttempts', newAttempts.toString());

        if (newAttempts >= 3) {
            setShowRecaptcha(true);
        }
    };

    const handleAuthSuccess = () => {
        sessionStorage.removeItem('failedLoginAttempts');
        sessionStorage.removeItem('captchaToken');
        setFailedAttempts(0);
        setShowRecaptcha(false);
    };

    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
        if (token) {
            sessionStorage.setItem("captchaToken", token);
            console.log("Captcha token stored:", token);
        } else {
            sessionStorage.removeItem("captchaToken");
        }
    }

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
                    {/*Show reCAPTCHA appears due to failed attempts */}
                    {isLogin && showRecaptcha && failedAttempts >= 3 && (
                        <div className="captcha-warning">
                            Multiple failed login attempts detected. Please complete the verification below.
                        </div>
                    )}

                    {isLogin ? (
                        <Login
                            captchaToken={captchaToken}
                            onLoginFailure={handleLoginFailure}
                            onLoginSuccess={handleAuthSuccess}
                            requiresCaptcha={showRecaptcha}
                        />
                    ) : (
                        <Register
                            captchaToken={captchaToken}
                            onRegisterSuccess={handleAuthSuccess}
                            requiresCaptcha={showRecaptcha}
                        />
                    )}
                    <div className="divider">
                        <span>or continue with</span>
                    </div>
                    <div className="social-row">
                        <button
                            className="social-btn google"
                            onClick={() => loginWithGoogle()}
                        >
                            Google
                        </button>
                    </div>

                    {showRecaptcha && (
                        <div className="captcha-container">
                            <ReCAPTCHA
                                sitekey={RECAPTCHA_KEY}
                                onChange={handleCaptchaChange}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;