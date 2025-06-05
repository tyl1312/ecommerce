import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import Typography from '@mui/material/Typography';
import success from '../assets/success.png';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [expandedCourses, setExpandedCourses] = useState([]);
    const { user, accessToken } = useAuth(); 
    const [popup, setPopup] = useState(false);
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/courses/all`, { 
                    withCredentials: true,
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                if (response.status === 200) {
                    setCourses(response.data.items || response.data.courses || response.data || []);
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
                console.error('Error response:', error.response?.data);
                if (error.response?.status === 401) {
                    localStorage.removeItem('accessToken');
                    window.location.href = '/login';
                }
            }
        };
        
        if (user && accessToken) {
            fetchCourses();
        }
    }, [user, accessToken]);

    const toggleQuizVisibility = (courseId) => {
        if (expandedCourses.includes(courseId)) {
            setExpandedCourses(expandedCourses.filter(id => id !== courseId));
        } else {
            setExpandedCourses([...expandedCourses, courseId]);
        }
    };

    const handleQuizClick = (courseTitle, quiz, quizTitle) => {
        const quizId = typeof quiz === 'object' ? quiz._id : quiz;
        
        const quizData = {
            courseTitle,
            quizId: quizId, 
            quizTitle: typeof quiz === 'object' ? quiz.title : quizTitle
        };
        
        console.log('Storing quiz data:', quizData); 
        localStorage.setItem('currentQuiz', JSON.stringify(quizData));
    };

    if (!user) {
        return <Navigate to="/login" />;
    }

    return (
        <section id="dashboard" className="w-full min-h-[calc(100vh-72px)] py-14 px-10">

            {popup && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-10 rounded-lg">
                        <img
                            className="justify-center items-center mx-auto"
                            style={{ width: "200px", height: "200px" }}
                            alt="Success Icon"
                            src={success}
                        />
                        <Typography variant="h5" component="h2" gutterBottom>
                            Email was sent successfully!
                        </Typography>
                        <div className="flex justify-center items-center mt-2">
                            <button 
                                className="w-20 h-10 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-md" 
                                onClick={() => setPopup(false)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                {courses.map(course => (
                    <div key={course._id} className="p-6 bg-white rounded-lg shadow-md">
                        {course.image && (
                            <img src={course.image} alt={course.courseTitle} className="mb-4 w-full h-auto" />
                        )}
                        <h2 className="text-3xl font-bold mb-2">{course.courseTitle}</h2>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-lg text-gray-700 mr-1">{course.description}</p>
                            <span className="text-lg text-gray-500 ml-1">{course.level}</span>
                        </div>

                        {expandedCourses.includes(course._id) ? (
                            <div>
                                {course.quiz?.map((quiz, index) => {
                                    const quizId = typeof quiz === 'object' ? quiz._id : quiz;
                                    const quizTitle = typeof quiz === 'object' ? quiz.title : `Quiz ${index + 1}`;
                                    
                                    return (
                                        <li 
                                            key={`${course._id}-${quizId}-${index}`}
                                            className="w-full flex justify-between items-center list-none"
                                        >
                                            <Link
                                                to={`/quiz/${encodeURIComponent(course.courseTitle)}/${quizId}`}
                                                className="text-blue-500 text-lg hover:bg-slate-100 w-full p-2 block"
                                                onClick={() => handleQuizClick(course.courseTitle, quiz, quizTitle)}
                                            >
                                                {quizTitle}
                                            </Link>
                                        </li>
                                    );
                                })}
                                <button 
                                    onClick={() => toggleQuizVisibility(course._id)} 
                                    className="text-blue-500 hover:underline mt-2"
                                >
                                    <ArrowDropUpIcon />
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => toggleQuizVisibility(course._id)} 
                                className="text-blue-500 hover:underline"
                            >
                                <ArrowDropDownIcon />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Dashboard;