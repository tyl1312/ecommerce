import { useEffect, useState, useRef } from 'react';
import logo from '../assets/HustEdu.png';
import { FaExclamationCircle } from 'react-icons/fa';
import { Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { checkStatus, setUserRole } from '../../../../frontend/src/redux/actions/userActions';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { AiOutlineLoading } from 'react-icons/ai';
import ReCAPTCHA from 'react-google-recaptcha';
import DOMPurify from 'dompurify';


/**
 * Signup component for user registration.
 * @returns The Signup form.
 */
const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const formRef = useRef(null);
    const recaptchaRef = useRef(null);

    const dispatch = useDispatch();
    const loggedIn = useSelector(state => state.user.loggedIn);

    useEffect(() => {
        const checkLoginStatus = async () => {
            await dispatch(checkStatus());
        };

        checkLoginStatus();
    });

    if (loggedIn) {
        return <Navigate to="/dashboard" />;
    }
    
    const handleRecaptchaChange = (value) => {
        setIsVerified(true);
    };
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(formRef.current);
        const inputData = Object.fromEntries(formData.entries());
        const email = DOMPurify.sanitize(inputData.email);

        const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}/
        if (!emailRegex.test(email)) {
            setErrorMessage('Invalid email address');
            return;
        } 

        if (isVerified){
            try {
                setIsLoading(true);
                const response = await axios.post(
                    import.meta.env.VITE_APP_API_URL + '/user/register',
                    inputData,
                    { withCredentials: true, timeout: 5000}
                );
                console.log(response);
                if (response.status === 201) {
                    const csrfToken = response.headers['x-csrf-token'];
                    localStorage.setItem('csrfToken', csrfToken);

                    // Set user role in Redux
                    await dispatch(setUserRole(response.data.user.role));
                    console.log(response.data.user.role);
                }
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
    
                // set error message based on error message from server
                let errorMessage = error.response.data.message;
                switch (errorMessage) {
                    case undefined || null:
                        errorMessage = 'Something went wrong';
                        break;
                    case 'Password is too weak':
                        errorMessage = 'Password must be 8+ characters with uppercase, lowercase, number, and special character';
                        break;
                    case 'reCAPTCHA verification failed':
                        errorMessage = 'Please verify that you are not a robot';
                        break;
                    default:
                        break;
                }
                
                if (isVerified) {
                    setIsVerified(false);
                    recaptchaRef.current.reset();
                }
                
                
                setErrorMessage(errorMessage);

            } 

        } else {
            setErrorMessage('Please verify that you are not a robot');
        }
    };


    return (
        <section
            id="signup"
            className="w-full min-h-[calc(100vh-72px)] py-14 flex justify-center hero-bg">
            {/* Sign up form */}
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="form-container-style"
            >
                <img
                    src={logo}
                    alt="HustEdu Logo"
                    className="w-20 h-20 mx-auto mb-2"
                />

                <h1 className="text-2xl font-bold mb-4 text-center">Sign up</h1>
                {/* Fields Container */}
                <div className="w-full flex flex-col gap-4">
                    {/* Username Field Wrapper*/}
                    <div className="flex flex-col gap-1">
                        <label
                            className="font-bold"
                            htmlFor="username"
                        >
                            Username
                        </label>
                        <input
                            className="form-input-style px-3 py-2"
                            type="text"
                            id="username"
                            name="username"
                            required
                        />
                    </div>
                    {/* Email Field Wrapper*/}
                    <div className="flex flex-col gap-1">
                        <label
                            className="font-bold"
                            htmlFor="email"
                        >
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
                    {/* Password Field Wrapper */}
                    <div className="flex flex-col gap-1">
                        <label
                            className="font-bold"
                            htmlFor="password"
                        >
                            Password
                        </label>
                        <div className="relative">
                            <input
                                className="password-input"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                autoComplete="off"
                                required
                            />
                            {/* Show password button */}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 h-fit w-fit my-auto mr-2 p-2 rounded-full hover:bg-gray-300"
                            >
                                {showPassword ? <HiEyeOff /> : <HiEye />}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label
                            className="font-bold"
                            htmlFor="confirmPassword"
                        >
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                className="password-input"
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                autoComplete="off"
                                required
                            />
                            {/* Show confirmPassword button */}
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 h-fit w-fit my-auto mr-2 p-2 rounded-full hover:bg-gray-300"
                            >
                                {showPassword ? <HiEyeOff /> : <HiEye />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error message */}
                {errorMessage && (
                    <p className="text-red-500 mt-4 inline-flex items-center text-sm text-center">
                        <FaExclamationCircle className="mr-1" />
                        {errorMessage}
                    </p>
                )}
                
                <ReCAPTCHA
                    ref={recaptchaRef}
                    className="mt-3"
                    sitekey={import.meta.env.VITE_APP_RECAPTCHA_SITE_KEY}
                    onChange={handleRecaptchaChange}
                    theme="light"
                />
                

                {/* Submit Button */}
                <button
                    className="w-full mt-6 py-3 px-6 bg-primary hover:bg-primary-shade text-white font-bold rounded-xl"
                    type="submit"
                >
                    {isLoading ? <AiOutlineLoading className="animate-spin h-6 w-6 mx-auto" /> : 'Create account'}
                </button>

                <p className="mt-6 text-gray-500 text-center">
                    Already have an account? {' '}
                    <Link
                        to="/login"
                        className="font-bold text-primary hover:text-primary-shade hover:underline">
                        Log in
                    </Link>
                </p>


            </form>
        </section>
    );
};

export default Signup;