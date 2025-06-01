import logo from '../assets/HustEdu.png';
import axios from 'axios';
import { AiOutlineLoading } from 'react-icons/ai';
import { FaExclamationCircle } from 'react-icons/fa';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { checkStatus } from '../redux/actions/userActions';
import DOMPurify from 'dompurify';
import Swal from 'sweetalert2';

const ForgotPassword = () => {
    const formRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState(''); 
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const dispatch = useDispatch();
    const loggedIn = useSelector(state => state.user.loggedIn);

    useEffect(() => {
        const checkLoginStatus = async () => {
            await dispatch(checkStatus());
        };

        checkLoginStatus();
    })

    if (loggedIn) {
        return <Navigate to="/dashboard" />
    }

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
        
        try {
            setLoading(true);
            const response = await axios.post(
                import.meta.env.VITE_APP_API_URL + '/user/forgot-password',
                { email: email },
                { withCredentials: true }
            );
            if (response.status === 200) {
                Swal.fire({
                    title: 'Success',
                    text: 'A reset password link has been sent to your email.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then((result) => {
                    navigate('/login');
                });
            }
        } catch (error) {
            console.error('Error sending email:', error);
            setErrorMessage('Error sending email. Please try again later.');
        } finally {
            setLoading(false);
        }

    };

    return (
        <section
            id="forgot-password"
            className="w-full min-h-[calc(100vh-72px)] py-14 flex justify-center hero-bg">

            {/* Forgot password form */}
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="form-container-style">

                <img
                    src={logo}
                    alt="HustEdu Logo"
                    className="w-20 h-20 mx-auto mb-2" />
                <h1 className="text-2xl font-bold mb-6 text-center">Forgot password</h1>

                <div className="w-full flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label
                            className="font-bold"
                            htmlFor="Email">
                            Please enter your email address. We will send you a link to reset your password.
                        </label>
                        <input
                            className="form-input-style px-3 py-2"
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Email"
                            required
                        />    
                    </div>          
                </div>

                {errorMessage && (
                    <p className="text-red-500 mt-6 inline-flex items-center text-sm text-center">
                        <FaExclamationCircle className="mr-1" />
                        {errorMessage}
                    </p>
                )}  

                <button
                    className="w-full mt-6 py-3 px-6 bg-primary hover:bg-primary-shade text-white font-bold rounded-xl"
                    type="submit">
                    {loading ? <AiOutlineLoading className="animate-spin h-6 w-6 mx-auto"/> : 'Send email'}
                </button>

                <p className="w-full flex flex-col gap-4">
                    <Link
                        to="/login"
                        className="mt-6 flex justify-end font-bold text-gray-500 hover:text-gray-800 hover:underline"
                    >
                        Back to login
                    </Link>
                </p>

            </form>

        </section>
    )
};

export default ForgotPassword;