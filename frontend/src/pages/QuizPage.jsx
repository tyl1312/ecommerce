import React, { useState, useEffect } from "react";
import { HiX } from 'react-icons/hi';
import { Navigate } from "react-router-dom";
import CircularProgress from '@mui/material/CircularProgress';
import { HiCheck, HiArrowRight } from 'react-icons/hi';
import { AiOutlineLoading } from 'react-icons/ai';
import { BsFillSkipForwardFill } from 'react-icons/bs';
import FeedbackMessage from '../components/FeedbackMessage';
import CompleteScreen from './CompleteScreen';
import Button from '../components/Button';
import { BsArrowClockwise } from 'react-icons/bs';
import axios from "axios";
import heart from '../assets/heart.png';
import { useAuth } from '../context/AuthContext';

const QuizPage = () => {
    const [loading, setLoading] = useState(true);
    const [isShaking, setIsShaking] = useState(false);
    const { user } = useAuth();
    const [listQuestion, setListQuestion] = useState([]);
    const [question, setQuestion] = useState('');
    const [quizComplete, setQuizComplete] = useState(false);
    const [progress, setProgress] = useState(0);
    const [numberOfQuestions, setNumberOfQuestions] = useState(0);
    const [correctQuestions, setCorrectQuestions] = useState(0);
    const [remainingLives, setRemainingLives] = useState(3);
    const [questionState, setQuestionState] = useState(null);
    const [selectedOption, setSelectedOption] = useState('');
    const [typedAnswer, setTypedAnswer] = useState('');
    const [choices, setChoices] = useState([]);
    const [questionDone, setQuestionDone] = useState(0);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const requiredXp = 8;

    const loggedIn = !!user;

    // Get quiz data from localStorage (set in Dashboard)
    const currentQuiz = JSON.parse(localStorage.getItem('currentQuiz') || '{}');
    const quizId = currentQuiz.quizId?._id || currentQuiz.quizId;

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!quizId || typeof quizId !== 'string') {
                console.error('Invalid quizId:', quizId);
                return;
            }

            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/quiz/questions/${quizId}`, { 
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    },
                    withCredentials: true 
                });
                if (response.status === 200) {
                    const questions = response.data.question;
                    setLoading(false);
                    setListQuestion(questions);
                    setNumberOfQuestions(questions.length);
                    randomQuestion(questions);
                    setStartTime(Date.now());
                }
            } catch (error) {
                console.error("Error fetching quiz:", error);
            }
        };

        fetchQuiz();
    }, [quizId]);

    useEffect(() => {
        const element = document.getElementById('Failed-title');
        if (element) {
            element.classList.add('visible');
        }
    }, [quizComplete]);

    if (!loggedIn) {
        return <Navigate to="/login" />;
    }

    useEffect(() => {
        setIsShaking(true);

        // Reset animation after 500ms (duration of animation)
        const timer = setTimeout(() => {
            setIsShaking(false);
        }, 500);

        return () => clearTimeout(timer);

    }, [remainingLives]);

    const randomQuestion = (questions) => {
        if (questions.length === 0) return;

        const randomIndex = Math.floor(Math.random() * questions.length);
        const selectedQuestion = questions[randomIndex];

        setQuestion(selectedQuestion);

        const newQuestions = [...questions];
        newQuestions.splice(randomIndex, 1);
        setListQuestion(newQuestions);

        // Prepare choices
        let choices = [];
        if (selectedQuestion.incorrectOptions && selectedQuestion.incorrectOptions.length > 0) {
            choices = [...selectedQuestion.incorrectOptions, selectedQuestion.correctOption];
            // Shuffle the choice
            for (let i = choices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [choices[i], choices[j]] = [choices[j], choices[i]];
            }
            setChoices(choices);
        } else {
            setChoices([]);
        }

        setSelectedOption('');
        setTypedAnswer('');
    };

    const handleNextQuestion = () => {
        if (questionDone === numberOfQuestions || remainingLives === 0) {
            setQuizComplete(true);
        } else {
            setQuestionState(null);
            randomQuestion(listQuestion);
        }
    };

    const checkAnswer = async (selectedAnswer) => {
        const normalizedAnswer = selectedAnswer.toLowerCase().trim();

        // Increment questionDone and check if the answer is correct
        setQuestionDone(prevQuestionDone => {
            const newQuestionDone = prevQuestionDone + 1;

            const correctAnswer = question.correctOption.toLowerCase().trim();
            const isCorrect = normalizedAnswer === correctAnswer;
            if (isCorrect) {
                setQuestionState('correct');
                setCorrectQuestions(prevCorrectQuestions => prevCorrectQuestions + 1);
            } else {
                setQuestionState('incorrect');
                setRemainingLives(remainingLives - 1);
            }

            // Calculate progress based on the new questionDone value
            const newProgress = (newQuestionDone * 100) / numberOfQuestions;
            setProgress(newProgress);

            // Check if the quiz is complete
            if (newQuestionDone === numberOfQuestions) {
                setEndTime(Date.now());
            }

            console.log("Question Done:", newQuestionDone);
            console.log("Progress:", newProgress);
            console.log('Remaining Lives:', remainingLives)

            return newQuestionDone;
        });
    };

    const calculateTimeTaken = () => {
        if (startTime && endTime) {
            const timeTaken = (endTime - startTime) / 1000;  // time in seconds
            const minutes = Math.floor(timeTaken / 60);
            const seconds = Math.floor(timeTaken % 60);
            return `${minutes} minutes and ${seconds} seconds`;
        }
        return null;
    };

    const updateExperience = async () => {
        try {
            const xp = correctQuestions * 10 / numberOfQuestions;
            if (xp >= requiredXp) {
                const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/progress/update`,
                    {
                        score: xp,
                        quizId: quizId 
                    },
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                        },
                        withCredentials: true
                    }
                );

                if (response.status === 200) {
                    console.log("Experience updated successfully");
                }
            } else {
                console.log("Your score is not high enough to update experience");
            }
        } catch (error) {
            console.error("Error updating experience:", error);
        }

        window.history.back();
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div
            id="quiz"
            className="w-full h-screen max-h-screen p-4 py-6 md:p-0 flex flex-col">
            {!quizComplete && (
                <div className="md:h-20">
                    <div className="w-full h-full max-w-5xl mx-auto flex items-center md:pt-12 md:px-4">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="hover:opacity-60 mr-4">
                            <HiX className="w-7 h-7" />
                        </button>

                        {/* Progress Bar */}
                        <div className="bg-gray-300 dark:bg-gray-700 h-4 w-full rounded-2xl overflow-x-hidden">
                            <div
                                className={`${progress <= 0 ? 'opacity-0' : ''
                                    } custom-transition h-full px-2 pt-1 bg-gradient-to-b from-primary-tint to-red-800 rounded-2xl`}
                                style={{ width: `${progress}%` }}>
                                <div className="bg-white/30 h-1 rounded-2xl" />
                            </div>
                        </div>

                        <div className="flex items-center ml-5">
                            <span className={`font-bold ${isShaking ? 'animate-shake' : ''}`}>{remainingLives}</span>

                            <img
                                src={heart}
                                alt="Remaining Lives"
                                className="w-10" />
                        </div>
                    </div>
                </div>
            )}

            {/* Quiz Main */}
            {!quizComplete && (
                <div className="w-full h-full my-2 flex flex-col md:grid justify-center items-center md:content-center">
                    <div className="w-full max-w-2xl md:w-[600px] h-full md:min-h-[450px] quiz-main-container gap-2 md:gap-6">
                        <h1 className="font-bold text-xl sm:text-2xl md:text-3xl">
                            {question.question && (
                                <div className="mt-10 flex flex-col justify-center">
                                    <span>{question.question}</span>
                                    <div className="font-medium text-2xl mt-6 sm:text-3xl md:text-4xl grid grid-cols-1 gap-2">
                                        {choices.length > 0 ? (
                                            choices.map((choice) => (
                                                <button
                                                    key={`id-${choice}`}
                                                    type="button"
                                                    className={`w-full h-full p-2 md:py-3 rounded-xl border-2 ${selectedOption === choice
                                                        ? 'bg-sky-200 border-2 border-sky-400 dark:bg-sky-700'
                                                        : `border-gray-300 dark:border-gray-700 ${!questionState && 'hover:bg-gray-200 dark:hover:bg-slate-800'
                                                        }`
                                                        }`}
                                                    onClick={() => setSelectedOption(choice)}
                                                    disabled={questionState}
                                                >
                                                    <div className="flex flex-col grow w-full">
                                                        <span className="inline-flex justify-center items-center grow">{choice}</span>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <input
                                                type="text"
                                                value={typedAnswer}
                                                onChange={(e) => setTypedAnswer(e.target.value)}
                                                placeholder="Type your answer here"
                                                className="w-full h-full p-2 md:py-3 rounded-xl border-2 border-gray-300 dark:border-gray-700"
                                                disabled={questionState}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </h1>
                        <div className="font-medium text-2xl sm:text-3xl md:text-4xl grid grid-cols-1 gap-2">
                        </div>
                    </div>
                </div>
            )}

            {quizComplete && (
                correctQuestions * 10 / numberOfQuestions >= requiredXp ? (
                    <CompleteScreen corectQuestions={correctQuestions} xp={correctQuestions * 10 / numberOfQuestions} time={calculateTimeTaken()} />
                ) : (
                    <div className="grow flex flex-col justify-center items-center text-center gap-8">
                        <h1
                            id="Failed-title"
                            className="font-bold text-4xl md:text-5xl lg:text-6xl opacity-transition"
                        >
                            Never give up! You should try again!
                        </h1>
                    </div>
                )
            )}

            {/* Quiz Footer */}
            <div
                className={`-mx-4 -mb-6 mt-4 max-md:pb-6 md:m-0 md:h-36 md:min-h-[144px] md:border-t-2 ${questionState === 'correct'
                    ? 'border-[#CEFEA8] bg-[#CEFEA8] dark:bg-slate-800 dark:border-gray-700'
                    : questionState === 'incorrect'
                        ? 'border-[#FED6DD] bg-[#FED6DD] dark:bg-slate-800 dark:border-gray-700'
                        : 'border-gray-300 dark:border-gray-700'
                    }`}
            >
                <div className="w-full h-full max-w-5xl mx-auto px-4 flex items-center">
                    {/* Footer Buttons */}
                    {!quizComplete && (
                        <div className="w-full flex flex-col md:flex-row justify-between md:items-center">
                            {!questionState ? (
                                // Skip Button
                                <Button
                                    type="button"
                                    btnStyle="hidden md:flex justify-center items-center gap-2 text-sky-500 border-2 border-sky-500 bg-transparent hover:bg-gray-200 dark:hover:bg-slate-800"
                                    onClick={() => checkAnswer('skip')}
                                    title="Skip"
                                    icon={<BsFillSkipForwardFill className="w-6 h-6" />}
                                />
                            ) : (
                                // Feedback Message
                                <FeedbackMessage
                                    questionState={questionState}
                                    answer={question.correctOption}
                                />
                            )}

                            {/* Check and Next Buttons */}
                            {!questionState ? (
                                // Check Button
                                <Button
                                    type="button"
                                    btnStyle={`flex justify-center items-center gap-2
                                        ${(!selectedOption && !typedAnswer)
                                            ? 'text-gray-500 bg-gray-300'
                                            : 'text-white dark:text-slate-800 bg-[#58CC02] dark:bg-lime-500 hover:bg-[#4CAD02] dark:hover:bg-lime-600'
                                        }
                                    `}
                                    onClick={() => checkAnswer(choices.length > 0 ? selectedOption : typedAnswer)}
                                    disabled={!(selectedOption || typedAnswer)}
                                    title="Check"
                                    icon={<HiCheck className="w-6 h-6" />}
                                />
                            ) : (
                                // Next Button
                                <Button
                                    type="button"
                                    btnStyle={`flex justify-center items-center gap-2 text-white dark:text-slate-800 ${questionState === 'correct'
                                        ? 'bg-[#58CC02] dark:bg-lime-500 hover:bg-[#4CAD02] dark:hover:bg-lime-600'
                                        : 'bg-red-600 dark:bg-red-400 hover:bg-red-700 dark:hover:bg-red-500'
                                        }`}
                                    onClick={() => handleNextQuestion()}
                                    title={!loading && 'Next'}
                                    icon={
                                        loading ? (
                                            <AiOutlineLoading className="text-white dark:text-slate-800 animate-spin h-6 w-6 mx-auto" />
                                        ) : (
                                            <HiArrowRight className="w-5 h-5" />
                                        )
                                    }
                                />
                            )}
                        </div>
                    )}

                    {quizComplete && (
                        <div className="w-full flex justify-between gap-2">
                            {/* Try Again Button */}
                            <Button
                                type="button"
                                btnStyle="flex justify-center items-center gap-2 text-sky-500 border-2 border-sky-500 bg-transparent hover:bg-gray-200 dark:hover:bg-slate-800"
                                onClick={() => window.location.reload()}
                                title="Try Again"
                                icon={<BsArrowClockwise className="w-5 h-5 stroke-1" />}
                            />

                            {/* Continue Button */}
                            <Button
                                type="button"
                                btnStyle="flex justify-center items-center gap-2 text-white dark:text-slate-800 bg-[#58CC02] hover:bg-[#4CAD02]"
                                onClick={() => updateExperience()}
                                title="Continue"
                                icon={<HiArrowRight className="w-5 h-5" />}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizPage;