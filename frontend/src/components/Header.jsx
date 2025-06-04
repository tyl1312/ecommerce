import React from "react";
import { Link } from "react-router-dom";

import logo from "../assets/HustEdu.png";
import Button from "@mui/material/Button";


const Header = () => {

    return (
        <header className="bg-white dark:bg-slate-700 border-b z-50">
            <nav className="mx-auto max-w-7xl flex items-center justify-between p-3 lg:px-8">
                <Link to="/">
                    <img
                        src={logo}
                        alt="HustEdu Logo"
                        className="w-12 h-12" />
                </Link>

                <div>
                    <Link to="/register">
                        <Button color="success" sx={{ 'margin': '5px', 'border-radius': '8px' }}>
                            Sign Up
                        </Button>
                    </Link>

                    <Link to="/login">
                        <Button variant="contained" color="success" sx={{ 'margin': '5px', 'border-radius': '8px' }}>
                            Login
                        </Button>
                    </Link>
                </div>
            </nav>
        </header>
    );
};

export default Header;