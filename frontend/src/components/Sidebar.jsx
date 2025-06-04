import { NavLink } from "react-router-dom";
import logo from "../assets/HustEdu.png";
import { sidebarNavItems } from "../constants/constants";
import { FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext'; 

const Sidebar = () => {
    const { user, logout } = useAuth(); 

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

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
                {/* Show logo text on larger screens */}
                <span className="hidden xl:block text-xl font-bold text-primary">
                    HustEdu
                </span>
            </NavLink>

            {/* User info section */}
            {user && (
                <div className="w-full mt-4 p-3 bg-gray-100 rounded-lg hidden xl:block">
                    <p className="text-sm font-medium truncate">
                        {user.profile?.firstName && user.profile?.lastName 
                            ? `${user.profile.firstName} ${user.profile.lastName}`
                            : user.username
                        }
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
            )}

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
                    onClick={handleLogout} // Use the handleLogout function
                    className="sidebar-btn text-red-600 hover:bg-red-50"
                >
                    <FiLogOut className="sidebar-btn-icon" />
                    <span className="sidebar-text">Log out</span>
                </button>
            </nav>

            {/* Bottom section with user stats (optional) */}
            {user && (
                <div className="w-full mt-auto pt-4 border-t border-gray-200 hidden xl:block">
                    <div className="text-center">
                        <p className="text-xs text-gray-500">Experience Points</p>
                        <p className="text-lg font-bold text-primary">
                            {user.experience || 0} XP
                        </p>
                    </div>
                </div>
            )}
        </aside>
    )
};

export default Sidebar;