/*
 * Source code written by SEGP Group P
 * Questionnaire Modification component for Nottingham s-CPD website
 * External libraries used: react, react-router-dom, ethers
 */
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FiArrowLeft } from 'react-icons/fi';
import loadinggif from '../Images/loading.gif';
import { votingContractAddress, votingContractABI } from '../Address&Abi/VotingContract'
import { questionnaireContractAddress, questionnaireContractABI } from '../Address&Abi/QuestionnaireContract'

const EditQuestionnaire = () => {
    // Retrieve event ID from URL parameters
    const { eventId } = useParams();
    // State to store event details
    const [eventDetails, setEventDetails] = useState(null);
    // State to track loading state
    const [loading, setLoading] = useState(false); 

    // Form state for Question 1
    const [question1, setQuestion1] = useState('');
    const [answer1A, setAnswer1A] = useState('');
    const [answer1B, setAnswer1B] = useState('');
    const [correctAnswer1, setCorrectAnswer1] = useState('');

    // Form state for Question 2
    const [question2, setQuestion2] = useState('');
    const [answer2A, setAnswer2A] = useState('');
    const [answer2B, setAnswer2B] = useState('');
    const [correctAnswer2, setCorrectAnswer2] = useState('');

    // State to store signer's Ethereum address
    const [signerAddress, setSignerAddress] = useState('');

    // Ethereum provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);   
    const signer = provider.getSigner();
    // Ethereum contract instances
    const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
    const questionnaireContract = new ethers.Contract(questionnaireContractAddress, questionnaireContractABI, signer);

    // Fetch event and questionnaire details on component mount
    useEffect(() => {
        const fetchEventAndQuestionnaireDetails = async () => {
            try {
                // Fetch event details
                const eventDetailsResponse = await votingContract.getEventDetailsWithFinalTokenAmount(eventId);
                const eventDetails = {
                    eventId: eventId,
                    name: eventDetailsResponse[0],
                    time: eventDetailsResponse[1].toNumber(),
                    venue: eventDetailsResponse[2],
                    ipfsHash: eventDetailsResponse[3],
                    description: eventDetailsResponse[4],
                    finalTokens: eventDetailsResponse[5].toNumber(),
                };
                setEventDetails(eventDetails);

                // Fetch questionnaire details
                const questionnaireDetails = await questionnaireContract.getQuestionnaire(eventId);
                const [questions, options, correctAnswers] = questionnaireDetails;
                setQuestion1(questions[0]);
                setAnswer1A(options[0][0]);
                setAnswer1B(options[0][1]);
                setCorrectAnswer1(correctAnswers[0]);
                setQuestion2(questions[1]);
                setAnswer2A(options[1][0]);
                setAnswer2B(options[1][1]);
                setCorrectAnswer2(correctAnswers[1]);
            } catch (error) {
                console.error('Error fetching details:', error);
            }
        };
    
        fetchEventAndQuestionnaireDetails();

        async function fetchSignerAddress() {
            try {
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                setSignerAddress(address);
            } catch (error) {
                console.error('Error fetching signer address:', error);
            }
        }
    
        fetchSignerAddress();
    }, [eventId]);        

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Construct questionnaire data
            const questions = [question1, question2];
            const options = [
                [answer1A, answer1B],
                [answer2A, answer2B],
            ];
            const correctAnswers = [correctAnswer1, correctAnswer2];

            // Update questionnaire contract with edited questionnaire
            setLoading(true);
            const transaction = await questionnaireContract.addQuestionnaire(eventId, questions, options, correctAnswers);
            await transaction.wait();
            setLoading(false);
            alert('Questionnaire edited successfully');

        } catch (error) {
            console.error('Error submitting questionnaire:', error);
        }
    };

    // Render loading indicator if event details are not yet fetched
    if (!eventDetails) {
        return <p>Loading...</p>;
    }

    // Render the EditQuestionnaire component UI
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
				<Link to="/questionnairecreationeventlist" className="text-blue-500 ml-4 mt-2 text-sm font-medium flex items-center">
                    <FiArrowLeft className="h-5 w-5 mr-1" />
                    Back to Questionnaire Creation Event List
                </Link>
            </div>

            {/* Render questioannaire details */}
            <h3 className="text-2xl lg:text-4xl font-bold text-center text-[#0b287b] mt-4 mb-8">Edit Questionnaire</h3>
            <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
                <img src={`${eventDetails.ipfsHash}`} alt={eventDetails.name} className="w-full h-60 lg:h-96 object-cover mb-4 rounded-lg" />
                <p className="text-lg font-semibold text-gray-800">Event ID: {eventDetails.eventId}</p>
                <p className="mt-1 text-gray-600">Name: {eventDetails.name}</p>
                <p className="mt-1 text-gray-600">Token Reward: {eventDetails.finalTokens === 0 ? 5 : eventDetails.finalTokens}</p>

                <form
                    onSubmit={handleSubmit}
                    className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md"
                >
                    {/* Form fields for Question 1 */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="question1">
                            Question 1:
                        </label>
                        <input
                            className="w-full px-3 py-2 border-b rounded-md focus:outline-none focus:border-blue-500 mb-3"
                            type="text"
                            id="question1"
                            placeholder="Enter Question 1"
                            value={question1}
                            onChange={(e) => setQuestion1(e.target.value)}
                        />
                        <input
                            className="w-full px-3 py-2 border-b rounded-md focus:outline-none focus:border-blue-500 mb-3"
                            type="text"
                            placeholder="Enter Answer 1A"
                            value={answer1A}
                            onChange={(e) => setAnswer1A(e.target.value)}
                        />
                        <input
                            className="w-full px-3 py-2 border-b rounded-md focus:outline-none focus:border-blue-500 mb-3"
                            type="text"
                            placeholder="Enter Answer 1B"
                            value={answer1B}
                            onChange={(e) => setAnswer1B(e.target.value)}
                        />
                        <select
                            className="w-full px-3 py-2 border-b rounded-md focus:outline-none focus:border-blue-500 mb-3"
                            value={correctAnswer1}
                            onChange={(e) => setCorrectAnswer1(e.target.value)}
                        >
                            <option value="">Select Correct Answer</option>
                            <option value="1">1A</option>
                            <option value="2">1B</option>
                        </select>
                    </div>
                    {/* Form fields for Question 2 */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-lg font-bold mb-2" htmlFor="question2">
                            Question 2:
                        </label>
                        <input
                            className="w-full px-3 py-2 border-b rounded-md focus:outline-none focus:border-blue-500 mb-3"
                            type="text"
                            id="question2"
                            placeholder="Enter Question 2"
                            value={question2}
                            onChange={(e) => setQuestion2(e.target.value)}
                        />
                        <input
                            className="w-full px-3 py-2 border-b rounded-md focus:outline-none focus:border-blue-500 mb-3"
                            type="text"
                            placeholder="Enter Answer 2A"
                            value={answer2A}
                            onChange={(e) => setAnswer2A(e.target.value)}
                        />
                        <input
                            className="w-full px-3 py-2 border-b rounded-md focus:outline-none focus:border-blue-500 mb-3"
                            type="text"
                            placeholder="Enter Answer 2B"
                            value={answer2B}
                            onChange={(e) => setAnswer2B(e.target.value)}
                        />
                        <select
                            className="w-full px-3 py-2 border-b rounded-md focus:outline-none focus:border-blue-500 mb-3"
                            value={correctAnswer2}
                            onChange={(e) => setCorrectAnswer2(e.target.value)}
                        >
                            <option value="">Select Correct Answer</option>
                            <option value="1">2A</option>
                            <option value="2">2B</option>
                        </select>
                    </div>
                    {/* Submit button */}
                    <div className="mb-4">
                        <button
                            className="w-full bg-[#002D74] text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Edit Questionnaire
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditQuestionnaire;
