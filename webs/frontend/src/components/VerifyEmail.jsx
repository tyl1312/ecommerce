import React, { useEffect, useState } from 'react';
import { Link, Navigate, useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';

const VerifyEmail = () => {
    const { status } = useParams();
    const navigate = useNavigate();
    const loggedIn = useSelector(state => state.user.loggedIn);

    useEffect(() => {
        if (status === "success") {
            Swal.fire({
                title: "Success",
                text: "You have successfully verified your email.",
                icon: "success",
                confirmButtonText: "OK"
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/login");
                }
            });
        } else if (status === "failed") {
            Swal.fire({
                title: "Failed",
                text: "An error occurred while verifying your email. Please try again",
                icon: "error",
                confirmButtonText: "Try Again"
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/login");
                }
            });
        }
    }, [status, navigate]);

    if (!loggedIn) {
        return <Navigate to="/login" />;
    }

    return (
        <section id="verifyEmail" className="w-full min-h-[calc(100vh-72px)] py-14">

        </section>
    );
};

export default VerifyEmail;