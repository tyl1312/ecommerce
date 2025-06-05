import React, { useState, useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import ResetPassword from './ResetPassword';

const ProtectedRoute = ({ element: Component, ...rest }) => {
    const { token } = useParams();
    const [isValidToken, setIsValidToken] = useState(null);

    useEffect(() => {
        if (token) {
            axios.post( 
                import.meta.env.VITE_API_URL + '/user/validate-reset-token', 
                { token })
                .then(() => setIsValidToken(true))
                .catch(() => setIsValidToken(false));
        } else {
            setIsValidToken(false);
        }
    }, [token]);

    if (isValidToken == null) {
        return (
            <div className="flex justify-center items-center h-screen">
                <CircularProgress />
            </div>
        )
    }
    console.log('isValidToken:', isValidToken)

    return isValidToken ? <ResetPassword/> : <Navigate to="/login" />;
};

export default ProtectedRoute;
