/*
 * Source code written by SEGP Group P
 * Claim Form component for Nottingham s-CPD website  
 * External libraries used: ethers, react-router-dom
 */
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FiArrowLeft } from 'react-icons/fi';
import loadinggif from '../Images/loading.gif';
import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract'
import { votingContractAddress, votingContractABI } from '../Address&Abi/VotingContract'
import { NOTTAddress, NOTTABI } from '../Address&Abi/NottinghamCoinContract'
import { questionnaireContractAddress, questionnaireContractABI } from '../Address&Abi/QuestionnaireContract'

const Claim = () => {
    // Retrieve the event ID from the URL parameters
    const { eventId } = useParams();

    // States to manage various aspects of the claim form
    const [event, setEvent] = useState(null);
    const [questionnaire, setQuestionnaire] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [claimSuccess, setClaimSuccess] = useState(false);
    const [claimingInProgress, setClaimingInProgress] = useState(false);
    const [canClaim, setCanClaim] = useState(false);
    const [signerAddress, setSignerAddress] = useState('');
    const [loading, setLoading] = useState(false);

    // Initialize Ethereum provider and contracts
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);
    const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
    const questionnaireContract = new ethers.Contract(questionnaireContractAddress, questionnaireContractABI, signer);
    const NOTTContract = new ethers.Contract(NOTTAddress, NOTTABI, signer);

    // Fetch event details and signer address on component mount and updates
    useEffect(() => {
        async function fetchEventDetails() {
            // Fetch event details from Event Registry and Voting contracts
            try {
                // Fetch event data from Event Registry contract
                const eventData = await eventRegistryContract.getEvent(eventId);
                // Fetch additional token amount details from Voting contract
                const details = await votingContract.getEventDetailsWithFinalTokenAmount(eventId);
                // Consolidate event details
                const eventDetails = {
                    eventId: eventData.eventId,
                    name: eventData.name,
                    time: eventData.time,
                    venue: eventData.venue,
                    ipfsHash: eventData.ipfsHash,
                    description: eventData.description,
                    finalTokens: details[5].toNumber(),
                };
                setEvent(eventDetails);

                // Check if the current user has already claimed tokens for this event   
                const userAddress = await signer.getAddress();
                const claimed = await NOTTContract.hasClaimed(eventId, userAddress);
                setClaimSuccess(claimed);
    
                // Fetch questionnaire for the event
                let fetchedQuestionnaire = null;
                const questionnaireExists = await questionnaireContract.questionnaireExists(eventId);
                if (questionnaireExists) {
                    fetchedQuestionnaire = await questionnaireContract.getQuestionnaire(eventId);
                } else {
                    // Set default questionnaire if none exists
                    fetchedQuestionnaire = {
                        questions: ['Did you enjoy the event?', 'Did you gain something out of the event?'],
                        options: [['Yes', 'No'], ['Yes', 'No']],
                        correctAnswers: ['1', '1'],
                    };
                }
                setQuestionnaire(fetchedQuestionnaire);
            } catch (error) {
                console.error('Error fetching event details:', error);
            }
        }
    
        if (eventId) {
            fetchEventDetails();
        }

        // Fetch signer address
        async function fetchSignerAddress() {
            try {
                const address = await signer.getAddress();
                setSignerAddress(address);
            } catch (error) {
                console.error('Error fetching signer address:', error);
            }
        }
    
        fetchSignerAddress();
    
        // Check if the current user can claim tokens for the event
        async function checkCanClaim() {
            try {
                const hasAttended = await NOTTContract.hasTakenAttendance(eventId, signerAddress);
                const hasClaimed = await NOTTContract.hasClaimed(eventId, signerAddress);
                setCanClaim(hasAttended && !hasClaimed);
            } catch (error) {
                console.error('Error checking if can claim tokens:', error);
            }
        }
    
        // Check claim eligibility
        if (eventId && signerAddress && NOTTContract && provider) {
            checkCanClaim();
        }
    }, [eventId, signerAddress, NOTTContract, provider, eventRegistryContract, votingContract, questionnaireContract]);
    
	
    // Update selected answers when user selects an option
    const handleAnswerSelection = (questionIndex, optionIndex) => {
        const updatedAnswers = [...selectedAnswers];
        updatedAnswers[questionIndex] = optionIndex;
        setSelectedAnswers(updatedAnswers);
    };

    // Claim tokens for the event
    const claimTokens = async () => {
        try {
            // Convert selected answers to string format
            const selectedAnswerStrings = selectedAnswers.map(answer => String(answer + 1));
            // Check if selected answers match correct answers
            const isQuestion1Correct = questionnaire.correctAnswers[0] === selectedAnswerStrings[0];
            const isQuestion2Correct = questionnaire.correctAnswers[1] === selectedAnswerStrings[1];

            // If both answers are correct, proceed with token claim
            if (isQuestion1Correct && isQuestion2Correct) {
                setClaimingInProgress(true);
                let tokensRewarded = event.finalTokens;
                if (tokensRewarded === 0) {
                    tokensRewarded = 5; // Default token reward if not specified
                }
                setLoading(true);
                // Initiate token claim transaction
                const transaction = await NOTTContract.claimTokens(eventId, tokensRewarded);
                await transaction.wait();
                setLoading(false);
                // Update claim success status and provide feedback
                setClaimSuccess(true);
                alert('Tokens claimed successfully.');
            } else {
                // If answers are incorrect, notify the user
                alert('Answers are incorrect. Please try again.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error claiming tokens:', error);
            setLoading(false);
        }
    };
	
    // Render loading message if event details or questionnaire are not yet fetched
    if (!event || !questionnaire) {
        return <div>Loading...</div>;
    }

    // Render the claim form UI
    return (
        <div className="relative">
            {/* Render Navbar component with signer address */}
            <Navbar signerAddress={signerAddress} />
    
            {/* Render loading overlay when transaction is in progress */}
            {loading && (
                <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                    <img src={loadinggif} alt="Loading..." className="h-28" />
                    <p className="text-white ml-3">Please wait for the transaction to be successful...</p>
                </div>
            )}
    
            {/* Render Back button */}
            <div className="flex items-center">
                <Link
                    to={`/attendance/${eventId}`}
                    className="text-blue-500 ml-4 mt-2 text-sm font-medium flex items-center"
                >
                    <FiArrowLeft className="h-5 w-5 mr-1" />
                    Back
                </Link>
            </div>
    
            {/* Render event details */}
            <h3 className="text-2xl lg:text-4xl font-bold text-center text-[#0b287b] mt-4 mb-8">
                {event.name}
            </h3>
            <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
                <img
                    src={`${event.ipfsHash}`}
                    alt={event.name}
                    className="w-full h-60 lg:h-96 object-cover mb-4 rounded-lg"
                />
                <p className="text-lg font-semibold text-gray-800">
                    Event ID: {event.eventId.toString()}
                </p>
                <p className="mt-1 text-gray-600">Name: {event.name}</p>
                <p className="mt-1 text-gray-600">Tokens Rewarded: {event.finalTokens === 0 ? 5 : event.finalTokens}</p>
    
                {/* Render questionnaire */}
                <div className="mt-4">
                    {questionnaire.questions.map((question, questionIndex) => (
                        <div key={questionIndex} className="mb-4">
                            <p className="font-semibold">{question}</p>
                            <div>
                                {questionnaire.options[questionIndex].map((option, optionIndex) => (
                                    <div key={optionIndex} className="flex items-center mb-2">
                                        <input
                                            type="radio"
                                            id={`question-${questionIndex}-option-${optionIndex}`}
                                            name={`question-${questionIndex}`}
                                            checked={selectedAnswers[questionIndex] === optionIndex}
                                            onChange={() => handleAnswerSelection(questionIndex, optionIndex)}
                                            className="mr-2"
                                        />
                                        <label htmlFor={`question-${questionIndex}-option-${optionIndex}`}>{option}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
    
                {/* Render claim button based on claim eligibility */}
                {claimSuccess ? (
                    <button
                        className="mt-4 bg-gray-400 text-white font-semibold px-4 py-2 rounded cursor-not-allowed"
                        disabled
                    >
                        Claimed
                    </button>
                ) : canClaim ? (
                    <button
                        onClick={claimTokens}
                        className={`mt-4 font-semibold px-4 py-2 rounded ${
                            claimingInProgress ? "bg-gray-400 text-white cursor-not-allowed" : "bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
                        }`}
                        disabled={claimingInProgress || !canClaim}
                    >
                        {claimingInProgress ? 'Claimed' : 'Claim'}
                    </button>
                ) : (
                    <button
                        className="mt-4 bg-gray-400 text-white font-semibold px-4 py-2 rounded cursor-not-allowed"
                        disabled
                    >
                        Not Claimable
                    </button>
                )}
            </div>
        </div>
    );
    
};

export default Claim;