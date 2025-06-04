import { useEffect } from 'react';
import { easeInOut, easeOut, stagger, useAnimate } from 'framer-motion';

const CompleteScreen = ({ corectQuestions, xp, time }) => {
    // This uses the useAnimate hook from Framer Motion to create a new animation scope.
    const [scope, animate] = useAnimate();

    // This useEffect hook will run once the component is mounted.
    // It is used to control the animations.
    useEffect(() => {
        const playAnimations = async () => {
            animate('.quiz-stat-container', { y: -20 }, { duration: 0 });
            await animate('#complete-title', { scale: 5, y: 100 }, { duration: 0 });
            animate('#complete-title', { opacity: 1, scale: 1 }, { duration: 0.3, ease: easeOut, type: 'tween' });
            await animate('#complete-title', { y: 0 }, { duration: 0.4, delay: 1, ease: easeInOut, type: 'tween' });
            await animate('#divider', { opacity: 1, width: '100%' }, { delay: 0.2, ease: easeInOut });
            await animate('.quiz-stat-container', { opacity: 1, y: 0 }, { duration: 0.5, delay: stagger(0.3), ease: easeOut });
        };

        playAnimations();
    }, [animate]);


    return (
        // This div is the animation scope. It will be used to animate the entire component.
        <div
            ref={scope}
            className="grow flex flex-col justify-center items-center text-center gap-8"
        >
            <h1
                id="complete-title"
                style={{ opacity: 0 }}
                className="font-bold text-4xl md:text-5xl lg:text-6xl"
            >
                Quiz Completed!
            </h1>
            <hr
                id="divider"
                style={{ opacity: 0, width: 0 }}
                className="w-full max-w-2xl border-4 border-primary"
            />
            {/* Quiz Statistics Cards */}
            <div className="w-full max-w-2xl flex flex-row gap-2 sm:gap-4 md:gap-8 font-bold justify-center">
                {/* Correct Question Card */}
                <div
                    style={{ opacity: 0 }}
                    className="quiz-stat-container bg-amber-400 rounded-lg"
                >
                    {/* Card Header */}
                    <div className="p-1">
                        <h2 className="uppercase">Correct Question</h2>
                    </div>
                    {/* Card Body */}
                    <div className="quiz-stat-body">
                        <h3 className="text-amber-700 dark:text-amber-400 p-1">{corectQuestions}</h3>
                    </div>
                </div>

                {/* XP Card */}
                <div
                    style={{ opacity: 0 }}
                    className="quiz-stat-container bg-sky-400 rounded-lg"
                >
                    {/* Card Header */}
                    <div className="p-1">
                        <h2 className="uppercase">Earned</h2>
                    </div>
                    {/* Card Body */}
                    <div className="quiz-stat-body">
                        <h3 className="text-sky-700 dark:text-sky-400 p-1">+{xp} XP</h3>
                    </div>
                </div>

                {/* Time Card */}
                <div
                    style={{ opacity: 0 }}
                    className="quiz-stat-container bg-lime-400 rounded-lg"
                >
                    {/* Card Header */}
                    <div className="p-1">
                        <h2 className="uppercase">Time</h2>
                    </div>
                    {/* Card Body */}
                    <div className="quiz-stat-body">
                        <h3 className="text-lime-700 dark:text-lime-400 p-1">{time}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompleteScreen;
