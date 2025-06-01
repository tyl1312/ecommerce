import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useSelector } from 'react-redux';

const Dictionary = () => {
    const loggedIn = useSelector(state => state.user.loggedIn);
    const [searchTerm, setSearchTerm] = useState('');
    const [meanings, setMeanings] = useState({});
    const [pronunciation, setPronunciation] = useState([]);
    const [word, setWord] = useState('');
    const [error, setError] = useState(false);
    const [audio, setAudio] = useState('');
    const [submitValue, setSubmitValue] = useState(''); // State for displaying the search term

    const handleInputChange = (e) => {
        const value = e.target.value;
        const cleanValue = value.replace(/[^\w\s]/gi, '');
        setSearchTerm(cleanValue);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (searchTerm) {
            setSubmitValue(searchTerm.toLowerCase());
            try {
                const response = await axios.get(
                    import.meta.env.VITE_APP_API_DICTIONARY+ `/${searchTerm}`
                );
                const data = response.data;
                setWord(data[0].word);
                const meaningsByPartOfSpeech = {};
                const pronunciationSet = new Set();
                const audioSet = new Set();

                for (let i = 0; i < data.length; i++) {
                    for (let j = 0; j < data[i].meanings.length; j++) {
                        const partOfSpeech = data[i].meanings[j].partOfSpeech;
                        const definitions = data[i].meanings[j].definitions;
                        // Checks if partOfSpeech already exists in the object
                        if (meaningsByPartOfSpeech.hasOwnProperty(partOfSpeech)) {
                            meaningsByPartOfSpeech[partOfSpeech].definitions.push(...definitions);
                        } else {
                            meaningsByPartOfSpeech[partOfSpeech] = {
                                partOfSpeech: partOfSpeech,
                                definitions: [...definitions],
                            };
                        }
                    }

                    data[i].phonetics.forEach((phonetic) => {
                        if (phonetic.text) {
                            pronunciationSet.add(phonetic.text);
                        }
                        if (phonetic.audio) {
                            audioSet.add(phonetic.audio);
                        }
                    });
                }

                // Chuyển đổi đối tượng meaningsByPartOfSpeech thành mảng newMeanings
                const newMeanings = Object.values(meaningsByPartOfSpeech);
                
                setMeanings(newMeanings);
                setPronunciation(Array.from(pronunciationSet));
                setAudio(Array.from(audioSet));
                setError(false);
            } catch (error) {
                setWord('');
                setMeanings({});
                setError(true);
                console.error(error);
            } finally {
                setSearchTerm('');
            }
        }
    };

    const playAudio = async () => {
        if (audio.length > 0) {
            const audioUrl = audio[0];
            const audioElement = new Audio(audioUrl);
            audioElement.play();
        } else {
            console.error('No audio found for the word.');
        }
    };

    if (!loggedIn) {
        return <Navigate to="/login" />;
    }

    return (
        <section
            id="dictionary"
            className="w-full min-h-screen p-4 md:p-8 fix top-0">
            <form
                className="max-w-md"
                onSubmit={handleSubmit}>

                <div className="flex items-center border-b border-teal-500 py-2">
                    <input
                        className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none"
                        id="searchTerm"
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        placeholder="Enter a search term"
                    />
                    <button
                        className="flex-shrink-0 bg-teal-500 hover:bg-teal-700 border-teal-500 hover:border-teal-700 text-sm border-4 text-white py-1 px-2 rounded"
                        type="submit">
                        Search
                    </button>
                </div>
            </form>

            <div className="max-w-4xl">

                {meanings.length > 0 ? (
                    <div className="mt-4">
                        <div className="flex justify-end flex-col items-start mb-3">
                            <h2 className="text-5xl font-semibold text-teal-500">{word}</h2>
                            <VolumeUpIcon className="text-teal-700 cursor-pointer" onClick={playAudio} />
                            {pronunciation.map((pron, index) => (
                                <span key={index} className="text-gray-500 text-sm">{pron}</span>
                            ))}
                        </div>
                        {meanings.map((meaning, index) => (
                            <div key={index} className="mb-2">
                                <span className="font-semibold text-xl">{`${meaning.partOfSpeech}`}</span>

                                <ul className="list-disc ml-6">
                                    {meaning.definitions.map((def, indexChild) => (
                                        <li key={indexChild}>{def.definition}</li>
                                    ))}
                                </ul>

                                {index !== meanings.length - 1 && (
                                    <hr className="my-2 border-gray-200" />
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    submitValue && error && <p className="text-red-500 mt-4">No meanings found for the searched word.</p>
                )}
            </div>
        </section>
    );
};

export default Dictionary;