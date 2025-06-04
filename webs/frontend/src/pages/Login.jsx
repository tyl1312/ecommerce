import { useState, useRef, useEffect } from 'react';
import logo from '../assets/HustEdu.png';
import { Link, Navigate } from 'react-router-dom';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { AiOutlineLoading } from 'react-icons/ai';
import { FaExclamationCircle } from 'react-icons/fa';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { checkStatus, setUserRole } from '../../../../frontend/src/redux/actions/userActions';
import { jwtDecode } from "jwt-decode";
import DOMPurify from 'dompurify';
import ReCAPTCHA from "react-google-recaptcha";

/**
 * Login component for user authentication.
 * @returns The login form.
 */
const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState(''); // state for displaying error message
    const [rateLitmit, setRateLimit] = useState(false);
    const [loading, setLoading] = useState(false);
    const formRef = useRef(null); // Reference to the form element
    const recaptchaRef = useRef(null); // Reference to the reCAPTCHA element
    const dispatch = useDispatch();
    const [isVerified, setIsVerified] = useState(true);
    const loggedIn = useSelector(state => state.user.loggedIn);
    const userData = useSelector(state => state.user.userData);
    const [numberOfLoginAttempts, setNumberOfLoginAttempts] = useState(0);


    useEffect(() => {
        const checkLoginStatus = async () => {
            await dispatch(checkStatus());
        };

        checkLoginStatus();
    });

    if (userData != null) {
        if (loggedIn && userData.role !== 'admin') {
            return <Navigate to="/dashboard" />;
        } else if (userData.role === 'admin') {
            return <Navigate to="/adminPanel" />;
        }
    }
    
    const handleRecaptchaChange = (value) => {
        setIsVerified(true);
    }
    
    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(formRef.current);
        const inputData = Object.fromEntries(formData.entries());
        const email = DOMPurify.sanitize(inputData.email);

        console.log("Email:", email, "--------------");
        
        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/;

        if (!emailRegex.test(email)) {
            setErrorMessage('Invalid email format');
            return;
        }

        if(rateLitmit){
            setErrorMessage('Too many login attempts, please try again after 15 minutes');
            return;
        }
        
        if(isVerified){
            try {
                setLoading(true); // set loading true before making the request
                const response = await axios.post(
                    import.meta.env.VITE_APP_API_URL + '/user/login',
                    inputData,
                    { withCredentials: true, timeout: 5000}
                );
    
                if (response.status === 200) {
                    const csrfToken = response.headers['x-csrf-token'];
                    localStorage.setItem('csrfToken', csrfToken);

                    const expirationTime = jwtDecode(response.data.accessToken).exp;
                    localStorage.setItem('expirationTime', expirationTime);
                    dispatch(setUserRole(response.data.user.role));
                    console.log(response.data.user.role);
                }
                setLoading(false);
    
            } catch (error) {
                setNumberOfLoginAttempts(numberOfLoginAttempts + 1);
                setLoading(false);
                
                let errorMessage = error.response.data.message;
                switch (true) {
                    case errorMessage.includes('Incorrect Email or Password'):
                        setErrorMessage('Incorrect credentials');
                        break;
                    case errorMessage.includes('Please complete the reCAPTCHA'):
                        setErrorMessage('Please complete the reCAPTCHA');
                        setNumberOfLoginAttempts(5);
                        break;
                    case errorMessage.includes('Too many login attempts from this IP, please try again after 15 minutes'):
                        setErrorMessage('Too many login attempts, please try again after 15 minutes');
                        setRateLimit(true);
                        break;
                    default:
                        setErrorMessage('Something went wrong');
                        break;
                }

                if (numberOfLoginAttempts >= 5 && isVerified && !rateLitmit) {
                    console.log("Number of login attempts:", numberOfLoginAttempts);
                    console.log("isVerified:", isVerified);
                    console.log("rateLimit:", rateLitmit);
                    setIsVerified(false);
                    recaptchaRef.current.reset();
                }

                console.error('Lỗi đăng nhập', error);
            }
        

        } else {
            setErrorMessage("Please complete the reCAPTCHA");
        }
    };

    return (
        <section
            id="login"
            className="w-full min-h-[calc(100vh-72px)] py-14 flex justify-center hero-bg"
        >
            {/* Log in form */}
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="form-container-style">
                <img
                    src={logo}
                    alt="HustEdu Logo"
                    className="w-20 h-20 mx-auto mb-2" />
                <h1 className="text-2xl font-bold mb-6 text-center">Log in</h1>

                <div className="w-full flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label
                            className="font-bold"
                            htmlFor="email">
                            Email
                        </label>
                        <input
                            className="form-input-style px-3 py-2"
                            type="email"
                            id="email"
                            name="email"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label
                            className="font-bold"
                            htmlFor="password">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                className="form-input-style w-full pl-3 pr-12 py-2 overflow-hidden"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                autoComplete="off"
                                required
                            />
                            {/* Show password button */}
                            <button
                                type="button"
                                onClick={handleShowPassword}
                                className="absolute inset-y-0 right-0 h-fit w-fit my-auto mr-2 p-2 rounded-full hover:bg-gray-300">
                                {showPassword ? <HiEyeOff /> : <HiEye />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Forgot password link */}
                <p className="w-full flex flex-col gap-4">
                    <Link
                        to="/forgot-password"
                        className="flex justify-end font-bold text-blue-400 hover:text-blue-600 hover:underline">
                        Forgot password?
                    </Link>
                </p>

                {/* Error message */}
                {errorMessage && (
                    <p className="text-red-500 mt-6 inline-flex items-center text-sm text-center">
                        <FaExclamationCircle className="mr-1" />
                        {errorMessage}
                    </p>
                )}

                
                {numberOfLoginAttempts >= 5 && (
                    <ReCAPTCHA
                        ref={recaptchaRef}
                        className="mt-3"
                        sitekey= {import.meta.env.VITE_APP_RECAPTCHA_SITE_KEY}
                        onChange={handleRecaptchaChange}
                        theme="light"
                    />)
                }
                
    
                
                {/* Submit Button */}
                <button
                    className="w-full mt-6 py-3 px-6 bg-primary hover:bg-primary-shade text-white font-bold rounded-xl"
                    type="submit"
                >
                    {loading ? <AiOutlineLoading className="animate-spin h-6 w-6 mx-auto" /> : 'Log in'}
                </button>
                

                <p className="mt-4 text-gray-500 dark:text-gray-400 text-center">
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        className="font-bold text-primary hover:text-primary-shade hover:underline"
                    >
                        Sign up
                    </Link>
                </p>
            </form>
        </section>
    );
};

export default Login;