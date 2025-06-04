import React, { useEffect, useState } from "react";
import { AiOutlineLoading } from 'react-icons/ai';
import { Navigate } from "react-router-dom";
import axios from "axios";
import escapeHTML from "../util/escapeHTML";
import { useAuth } from '../context/AuthContext';

const Leaderboards = () => {
    const [data, setData] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(false);
    const { user, accessToken } = useAuth();

    const loggedIn = !!user;

    useEffect(() => {
        const fetchUser = async () => {
            setFetchLoading(true);
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/experience`, { 
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                const allUsers = response.data.items;
                const sortedData = allUsers.sort((a, b) => b.experience - a.experience);
                
                // Get the top 10 users
                const topUsers = sortedData.slice(0, 10);
                const escapedData = topUsers.map((user) => {
                    return {
                        ...user,
                        username: escapeHTML(user.username),
                        experience: escapeHTML(user.experience)
                    }
                })
                setData(escapedData);
            } catch (error) {
                console.error(error);
            } finally {
                setFetchLoading(false);
            }
        };

        if (user && accessToken) {
            fetchUser();
        }
    }, [user]);

    if (!loggedIn) {
        return <Navigate to="/login" />;
    }

    // style the first three players in the leaderboard
    const rank = (index) => {
        if (index === 0) {
            return "ranking-first-style";
        } else if (index === 1) {
            return "ranking-second-style";
        } else if (index === 2) {
            return "ranking-third-style";
        } else {
            return "";
        }
    };

    return (
        <section
            id="leaderboard"
            className="w-full min-h-screen p-4 md:p-8">
            <h1 className="text-xl font-bold mb-8">Leaderboards</h1>

            <div className="mb-8 relative overflow-hidden rounded-xl shadow-lg text-white text-shadow bg-gradient-to-r from-green-600 to-green-800">
                <div className="relative p-8 z-10">
                    <h2 className="text-4xl font-bold mb-3">Rise to the top!</h2>
                    <p className="text-lg">Be the best and compete with others</p>
                </div>
            </div>

            {/* Leaderboard table */}
            <div className="box-container-style">
                <h2 className="text-xl font-bold mb-4">Rankings</h2>
                <div className="flex flex-col">
                    {fetchLoading && <AiOutlineLoading className="animate-spin text-4xl mx-auto" />}

                    {data.map((user, index) => (
                        <div
                            key={`id-${user.username}`}
                            className="w-auto flex items-center p-2 px-4 gap-4 rounded-xl odd:bg-slate-900/5"
                        >
                            <span className={`ranking-index-style ${rank(index)}`}>{index + 1}</span>
                            <div className="w-12 h-12 shrink-0">
                                <div className="w-12 h-12 bg-primary rounded-full flex justify-center items-center uppercase font-bold text-2xl text-white">
                                    {user.username?.charAt(0).toUpperCase()}
                                </div>
                            </div>
                            
                            <div className="flex flex-col flex-grow overflow-hidden">
                                <h3 className="font-bold truncate">{user.username}</h3>
                                <p className="text-gray-500 truncate">{user.experience} XP</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
};

export default Leaderboards;