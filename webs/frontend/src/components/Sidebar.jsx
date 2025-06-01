import { NavLink } from "react-router-dom";
import logo from "../assets/HustEdu.png";
import { sidebarNavItems } from "../constants/constants";
import { FiLogOut } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/actions/userActions';


const Sidebar = () => {
    const dispatch = useDispatch();
    return (
        <aside
            id="sidebar"
            className="hidden sm:flex flex-col items-center xl:items-start fixed z-30 z-full h-full min-h-full max-w-[88px] xl:max-w-[300px] p-6 px-4 border-r-2 border-gray-300">
            <NavLink
                to="/dashboard"
                className="w-fit xl:px-4 flex items-center gap-3 hover:opacity-70">
                <img
                    src={logo}
                    alt="HustEdu Logo"
                    className="w-20 h-20"
                />
            </NavLink>

            {/* Navigation Links */}
            <nav className="w-full mt-8 flex flex-col justify-between gap-2">
                {sidebarNavItems.map((item) => (
                    <NavLink
                        key={item.title}
                        to={item.path}
                        className="sidebar-btn"
                    >
                        {item.icon}
                        <span className="sidebar-text">{item.title}</span>
                    </NavLink>
                ))}

                {/* Logout Button */}
                <button
                    type="button"
                    onClick={() => dispatch(logout())}
                    className="sidebar-btn"
                >
                    <FiLogOut className="sidebar-btn-icon" />
                    <span className="sidebar-text">Log out</span>
                </button>
            </nav>
        </aside>
    )
};

export default Sidebar;