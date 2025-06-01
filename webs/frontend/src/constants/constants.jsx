import { HiOutlineHome, HiOutlineUserCircle } from 'react-icons/hi';
import { IoLanguage } from 'react-icons/io5';
import { MdOutlineLeaderboard } from 'react-icons/md';
import { FaGithub } from 'react-icons/fa';

const sidebarNavItems = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <HiOutlineHome className="sidebar-btn-icon" />,
  },
  {
    title: 'Dictionary',
    path: '/dictionary',
    icon: <IoLanguage className="sidebar-btn-icon" />,
  },
  {
    title: 'Leaderboards',
    path: '/leaderboards',
    icon: <MdOutlineLeaderboard className="sidebar-btn-icon" />,
  },
  {
    title: 'Profile',
    path: '/profile',
    icon: <HiOutlineUserCircle className="sidebar-btn-icon" />,
  },
];

const socialLinks = [
  {
    title: 'Github',
    url: '',
    icon: <FaGithub className="social-link" />,
  },
];


export { sidebarNavItems, socialLinks };
