import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/actions/userActions';
import { useRef, useState } from 'react';
import { CircularProgress } from '@mui/material';
import { FaExclamationCircle } from 'react-icons/fa';
import axios from 'axios';

export const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [changePasswordPopup, setChangePasswordPopup] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);
    const formRef = useRef(null);

    const handleLogout = async () => {
        await dispatch(logout());
        navigate('/login');
    }

    const openChangePasswordPopup = () => {
        setErrorMessage('');
        setChangePasswordPopup(true);
    };

    const closeChangePasswordPopup = () => {
        setChangePasswordPopup(false);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (submitLoading) return;
        setSubmitLoading(true);
        const formData = new FormData(formRef.current);
        const inputData = Object.fromEntries(formData.entries());

        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/user/change-password`,
                inputData,
                {
                    withCredentials: true,
                    headers: {
                        'X-CSRF-Token': localStorage.getItem('csrfToken')
                    }
                }
            );

            if (response.status === 200) {
                localStorage.setItem('csrfToken', response.headers['x-csrf-token']);
                closeChangePasswordPopup();
            }

        } catch (error) {
            console.error("Error changing password:", error);
            const csrfToken = error.response.headers['x-csrf-token'];
            localStorage.setItem('csrfToken', csrfToken);

            let errorMessage = error.response.data.message;
            switch (errorMessage) {
                case undefined || null:
                    errorMessage = 'Something went wrong';
                    break;
                case 'Password is too weak':
                    errorMessage = 'Password must be 8+ characters with uppercase, lowercase, number, and special character';
                    break;
                default:
                    break;
            }
            setErrorMessage(errorMessage);
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <div className="w-full min-h-[calc(100vh-72px)] py-14 px-10">
            <Card>
                <CardHeader title="Welcome to the administration" />
                <CardContent>
                    <div>
                        <Typography variant="h5" component="h2">
                            Learning English App Dashboard
                        </Typography>
                        <p className="mt-4 text-lg">Welcome to the dashboard of the Learning English App.</p>
                        <p className="text-lg">Here, you can manage and view various aspects of the app.</p>

                        <div className="flex justify-end gap-2">
                            <button
                                className="mt-6 py-5 px-6 bg-teal-500 hover:bg-teal-700 text-white font-bold rounded-xl"
                                onClick={handleLogout}>
                                Logout
                            </button>

                            <button
                                className="mt-6 py-5 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                                onClick={openChangePasswordPopup}>
                                Change Password
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {changePasswordPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg w-96">
                        <h3 className="text-2xl font-bold mb-4">Change Password</h3>
                        {/* Add your popup content here */}
                        <form
                            ref={formRef}
                            onSubmit={handleChangePassword}>
                            <div className="w-full flex flex-col gap-4">
                                <div>
                                    <input
                                        className="form-input-style px-4 py-2 w-full"
                                        type="password"
                                        id="oldPassword"
                                        name="oldPassword"
                                        placeholder='Old Password'
                                        required
                                    />
                                </div>

                                <div>
                                    <input
                                        className="form-input-style px-4 py-2 w-full"
                                        type="password"
                                        id="newPassword"
                                        name="newPassword"
                                        placeholder='New Password'
                                        required
                                    />

                                </div>

                                <div>
                                    <input
                                        className="form-input-style px-4 py-2 w-full"
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        placeholder='Confirm Password'
                                        required
                                    />

                                </div>
                            </div>

                            {/* Error message */}
                            {errorMessage && (
                                <p className="text-red-500 mt-3 inline-flex items-center text-sm text-center">
                                    <FaExclamationCircle className="mr-1" />
                                    {errorMessage}
                                </p>
                            )}

                            <div className="flex justify-center items-center mt-2">
                                <button
                                    type="submit"
                                    className="w-20 h-10 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"
                                >
                                    {submitLoading ? <CircularProgress size={25} className="animate-spin h-3 w-3" /> : 'Done'}
                                </button>
                            </div>
                        </form>

                        <div className="flex justify-center items-center mt-2">
                            <button className="w-20 h-10 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-md" onClick={closeChangePasswordPopup}>Close</button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    )
};