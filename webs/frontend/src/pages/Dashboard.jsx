import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import Typography from '@mui/material/Typography';
import success from '../assets/success.png';
import { setCourseData } from '../redux/actions/userActions';

const Dashboard = () => {
    const [expandedCourses, setExpandedCourses] = useState([]); // Initialize to empty array
    const userData = useSelector(state => state.user.userData);
    const loggedIn = useSelector(state => state.user.loggedIn);
    const [showAlert, setShowAlert] = useState(true);
    const [popup, setPopup] = useState(false);
    const [courses, setCourses] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_APP_API_URL + '/course/all', { withCredentials: true });
                if (response.status === 200) {
                    setCourses(response.data.items);
                    // console.log('Courses:', response.data.items);
                }
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };
        fetchCourses();
    }, []);
    
    const handleResendEmail = async() => {
        console.log('Resend email');
        try {
            const response = await axios.post(
                import.meta.env.VITE_APP_API_URL + '/user/resend-email', 
                { email: userData.email }, 
                { withCredentials: true });
            if (response.status === 200) {
                console.log('Email sent');
                setPopup(true);
            }
        } catch (error) {
            console.error('Error resending email:', error);
        }
    };

    const toggleQuizVisibility = (courseId) => {
        if (expandedCourses.includes(courseId)) {
            setExpandedCourses(expandedCourses.filter(id => id !== courseId)); // Collapse if already expanded
        } else {
            setExpandedCourses([...expandedCourses, courseId]); // Expand if not expanded
        }
    };

    const handleQuizClick = (courseTitle, quizId, quizTitle) => {
        if(courseTitle != null){
            console.log("-----------------------------")
            dispatch(setCourseData(courseTitle, quizId, quizTitle));
        }
    };

    if (!loggedIn) {
        return <Navigate to="/login" />;
    }

    return (
        <section id="dashboard" className="w-full min-h-[calc(100vh-72px)] py-14 px-10">
            {!userData.isVerified && showAlert && (
                <Alert severity="warning" onClose={() => {setShowAlert(false)}}>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm">Your account is currently not verified.</p>
                        </div>
                        
                        <div>
                            <button className="text-blue-500 hover:underline" onClick={handleResendEmail}>Resend Email</button>
                        </div>
                    </div>
                </Alert>
            )}

        {popup && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
                    <div className="bg-white p-10 rounded-lg">
                        <img
                            className='justify-center items-center mx-auto'
                            style={{ width: "200px", height: "200px" }}
                            alt='Success Icon'
                            src={success}/>
                        <Typography variant="h5" component="h2" gutterBottom>
                            Email was sent successfully!
                        </Typography>
                        <div className="flex justify-center items-center mt-2">
                            <button className="w-20 h-10 bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-md" onClick={() => { setPopup(false) }}>Close</button>
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
                            // Render quizzes if course is expanded
                            <div>
                                {course.quiz.map(quiz => (
                                    <li key={quiz._id} className="w-full flex justify-between items-center">
                                        <Link
                                            to={`/quiz/${course.courseTitle}/${quiz.title}`}
                                            className="text-blue-500 text-lg hover:bg-slate-100 w-full"
                                            onClick={() => handleQuizClick(course.courseTitle, quiz._id, quiz.title)}>
                                            {quiz.title}
                                        </Link>
                                    </li>
                                ))}
                                <button onClick={() => toggleQuizVisibility(course._id)} className="text-blue-500 hover:underline">
                                    <ArrowDropUpIcon />
                                </button>
                            </div>
                        ) : (
                            // Render button to expand quizzes
                            <button onClick={() => toggleQuizVisibility(course._id)} className="text-blue-500 hover:underline">
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