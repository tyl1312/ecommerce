import React, { useEffect, useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import { FaExclamationCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext'; 
import axios from 'axios';

const Profile = () => {
    const { user, loading, setUser } = useAuth(); 
    const [profileData, setProfileData] = useState(null);
    const [editProfilePopup, setEditProfilePopup] = useState(false);
    const [changePasswordPopup, setChangePasswordPopup] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const formRef = useRef(null);

    useEffect(() => {
        if (user) {
            const userData = {
                ...user,
                username: user.username || user.email?.split('@')[0],
                email: user.email,
                experience: user.experience || 0,
                createdAt: user.createdAt,
                fullName: user.profile?.firstName && user.profile?.lastName 
                    ? `${user.profile.firstName} ${user.profile.lastName}`
                    : user.username
            };
            setProfileData(userData);
        }
    }, [user]);

    if (!user && !loading) {
        return <Navigate to="/login" />;
    }

    if (loading || !profileData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <CircularProgress />
            </div>
        );
    }

    const firstLetter = profileData.username?.charAt(0).toUpperCase() || 'U';
    const date = new Date(profileData.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    const handleEditProfile = async (e) => {
        e.preventDefault();
        if (submitLoading) return;
        setSubmitLoading(true);
        setErrorMessage('');

        const formData = new FormData(formRef.current);
        const inputData = Object.fromEntries(formData.entries());

        try {
            //Get token
            const token = localStorage.getItem('accessToken');
            
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/auth/profile`,
                inputData,
                { 
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                const updatedUser = response.data;
                setUser(updatedUser);
                setProfileData({
                    ...updatedUser,
                    username: updatedUser.username || updatedUser.email?.split('@')[0],
                    experience: updatedUser.experience || 0
                });
                closeEditPopup();
            }

        } catch (error) {
            console.error("Error editing profile:", error);
            let errorMessage = error.response?.data?.message || 'Something went wrong';
            setErrorMessage(errorMessage);
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (submitLoading) return;
        setSubmitLoading(true);
        setErrorMessage('');

        const formData = new FormData(formRef.current);
        const inputData = Object.fromEntries(formData.entries());

        if (inputData.newPassword !== inputData.confirmPassword) {
            setErrorMessage('New passwords do not match');
            setSubmitLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/auth/change-password`,
                {
                    oldPassword: inputData.oldPassword,
                    newPassword: inputData.newPassword
                },
                {
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                closeChangePasswordPopup();
                alert('Password changed successfully!');
            }

        } catch (error) {
            console.error("Error changing password:", error);
            let errorMessage = error.response?.data?.message || 'Something went wrong';
            
            switch (errorMessage) {
                case 'Password is too weak':
                    errorMessage = 'Password must be 8+ characters with uppercase, lowercase, number, and special character';
                    break;
                case 'Invalid old password':
                    errorMessage = 'Current password is incorrect';
                    break;
                default:
                    break;
            }
            setErrorMessage(errorMessage);
        } finally {
            setSubmitLoading(false);
        }
    };

    const openEditPopup = () => {
        setErrorMessage('');
        setEditProfilePopup(true);
    };

    const closeEditPopup = () => {
        setEditProfilePopup(false);
        setErrorMessage('');
    };

    const openChangePasswordPopup = () => {
        setErrorMessage('');
        setChangePasswordPopup(true);
    };

    const closeChangePasswordPopup = () => {
        setChangePasswordPopup(false);
        setErrorMessage('');
    };

    return (
        <section
            id="profile"
            className="w-full min-h-screen p-4 md:p-8"
        >
            {/* Profile Info */}
            <div className="box-container-style mb-8 flex flex-col sm:flex-row items-center gap-4">
                <div className="w-32 h-32 bg-primary rounded-full flex justify-center items-center uppercase font-bold text-6xl text-white">
                    {firstLetter}
                </div>
                <div className="flex flex-col gap-2 text-center sm:text-left flex-grow">
                    <h2 className="text-2xl font-bold">{profileData.fullName || profileData.username}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{profileData.email}</p>
                    <p className="text-gray-500 dark:text-gray-400">{`Joined ${date}`}</p>
                </div>
                <div className="flex justify-end flex-col gap-2 sm:text-left">
                    <button
                        className="mt-2 py-3 px-6 bg-green-500 hover:bg-teal-700 text-white font-bold rounded-xl"
                        onClick={openEditPopup}>
                        Edit Profile
                    </button>
                    {!profileData.isGoogleUser && (
                        <button
                            className="mt-2 py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                            onClick={openChangePasswordPopup}>
                            Change Password
                        </button>
                    )}
                </div>
            </div>

            {/* Edit Profile Popup */}
            {editProfilePopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded-lg w-96">
                        <h3 className="text-2xl font-bold mb-4">Edit Profile</h3>
                        <form ref={formRef} onSubmit={handleEditProfile}>
                            <div className="w-full flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Username</label>
                                    <input
                                        className="form-input-style px-4 py-2 w-full border rounded"
                                        type="text"
                                        name="username"
                                        defaultValue={profileData.username}
                                        placeholder='New Username'
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">First Name</label>
                                    <input
                                        className="form-input-style px-4 py-2 w-full border rounded"
                                        type="text"
                                        name="firstName"
                                        defaultValue={profileData.profile?.firstName || ''}
                                        placeholder='First Name'
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Last Name</label>
                                    <input
                                        className="form-input-style px-4 py-2 w-full border rounded"
                                        type="text"
                                        name="lastName"
                                        defaultValue={profileData.profile?.lastName || ''}
                                        placeholder='Last Name'
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Current Password</label>
                                    <input
                                        className="form-input-style px-4 py-2 w-full border rounded"
                                        type="password"
                                        name="password"
                                        placeholder='Enter current password to confirm changes'
                                        required
                                    />
                                </div>
                            </div>

                            {/* Error message */}
                            {errorMessage && (
                                <p className="text-red-500 mt-3 inline-flex items-center text-sm">
                                    <FaExclamationCircle className="mr-1" />
                                    {errorMessage}
                                </p>
                            )}

                            <div className="flex justify-center items-center mt-4 gap-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md"
                                    disabled={submitLoading}
                                >
                                    {submitLoading ? <CircularProgress size={20} color="inherit" /> : 'Save Changes'}
                                </button>
                                <button 
                                    type="button"
                                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-md" 
                                    onClick={closeEditPopup}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Popup */}
            {changePasswordPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-8 rounded-lg w-96">
                        <h3 className="text-2xl font-bold mb-4">Change Password</h3>
                        <form ref={formRef} onSubmit={handleChangePassword}>
                            <div className="w-full flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Current Password</label>
                                    <input
                                        className="form-input-style px-4 py-2 w-full border rounded"
                                        type="password"
                                        name="oldPassword"
                                        placeholder='Current Password'
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">New Password</label>
                                    <input
                                        className="form-input-style px-4 py-2 w-full border rounded"
                                        type="password"
                                        name="newPassword"
                                        placeholder='New Password'
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                                    <input
                                        className="form-input-style px-4 py-2 w-full border rounded"
                                        type="password"
                                        name="confirmPassword"
                                        placeholder='Confirm New Password'
                                        required
                                    />
                                </div>
                            </div>

                            {/* Error message */}
                            {errorMessage && (
                                <p className="text-red-500 mt-3 inline-flex items-center text-sm">
                                    <FaExclamationCircle className="mr-1" />
                                    {errorMessage}
                                </p>
                            )}

                            <div className="flex justify-center items-center mt-4 gap-2">
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md"
                                    disabled={submitLoading}
                                >
                                    {submitLoading ? <CircularProgress size={20} color="inherit" /> : 'Change Password'}
                                </button>
                                <button 
                                    type="button"
                                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-md" 
                                    onClick={closeChangePasswordPopup}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Profile Statistics */}
            <div className="box-container-style mb-8 flex flex-col gap-4">
                <div>
                    <h4 className="text-gray-500 dark:text-gray-400">Total XP:</h4>
                    <h2 className="text-2xl font-bold">{profileData.experience || 0}</h2>
                </div>
                
                {/* Additional profile stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                        <h4 className="text-gray-500 dark:text-gray-400">Completed Courses</h4>
                        <h3 className="text-xl font-bold">{profileData.completedCourses?.length || 0}</h3>
                    </div>
                    <div className="text-center">
                        <h4 className="text-gray-500 dark:text-gray-400">Enrolled Courses</h4>
                        <h3 className="text-xl font-bold">{profileData.enrolledCourses?.length || 0}</h3>
                    </div>
                    <div className="text-center">
                        <h4 className="text-gray-500 dark:text-gray-400">Quiz Results</h4>
                        <h3 className="text-xl font-bold">{profileData.quizResults?.length || 0}</h3>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Profile;