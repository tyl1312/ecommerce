import React, { useState, useRef } from 'react';
import axios from 'axios';
import logo from '../assets/HustEdu.png';
import { FaExclamationCircle } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { AiOutlineLoading } from 'react-icons/ai';
import Swal from 'sweetalert2';

const ResetPassword = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const formRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState('');
    const { token } = useParams(); // Assume token is passed via URL parameters
    const navigate = useNavigate();


    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData(formRef.current);
        const inputData = Object.fromEntries(formData.entries());
        // Send form data to the server
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_APP_API_URL}/user/reset-password/${token}`,
                inputData);

            if (response.status === 200) {
                Swal.fire({
                    title: 'Success',
                    text: 'Your password has been reset successfully. Please log in.',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    navigate('/login');
                });
            }
        } catch (error) {
            setErrorMessage(error.response.data.message);
        }
    };

    return (
        <section
            id="resetPassword"
            className="w-full min-h-[calc(100vh-72px)] py-14 flex justify-center hero-bg"
        >
            {/* Reset password form */}
            <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="form-container-style">
                <img
                    src={logo}
                    alt="HustEdu Logo"
                    className="w-20 h-20 mx-auto mb-2" />
                <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>

                <div className="w-full flex flex-col gap-4">

                    <div className="flex flex-col gap-1">
                        <label className="font-bold"
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
                                onClick={() => setShowPassword(!showPassword)}                                
                                className="absolute inset-y-0 right-0 h-fit w-fit my-auto mr-2 p-2 rounded-full hover:bg-gray-300">
                                {showPassword ? <HiEyeOff /> : <HiEye />}
                            </button>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-1">
                        <label
                            className="font-bold"
                            htmlFor="confirmPassword">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                className="form-input-style w-full pl-3 pr-12 py-2 overflow-hidden"
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
                                className="absolute inset-y-0 right-0 h-fit w-fit my-auto mr-2 p-2 rounded-full hover:bg-gray-300">
                                {showConfirmPassword ? <HiEyeOff /> : <HiEye />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error message */}
                {errorMessage && (
                    <p className="text-red-500 mt-6 inline-flex items-center text-sm text-center">
                        <FaExclamationCircle className="mr-1" />
                        {errorMessage}
                    </p>
                )}
                
                {/* Submit Button */}
                <button
                    className="w-full mt-6 py-3 px-6 bg-primary hover:bg-primary-shade text-white font-bold rounded-xl"
                    type="submit"
                >
                    {isLoading ? <AiOutlineLoading className="animate-spin h-6 w-6 mx-auto" /> : 'Reset Password'}
                </button>
            </form>
        </section>
    );
};

export default ResetPassword;
