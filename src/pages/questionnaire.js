import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FiArrowLeft } from 'react-icons/fi';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const questionnaireContractAddress = '0x215D0AfFb688D11D353cF824514C81d43d88F661';
const questionnaireContractABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_eventId",
				"type": "uint256"
			},
			{
				"internalType": "string[]",
				"name": "_questions",
				"type": "string[]"
			},
			{
				"internalType": "string[][]",
				"name": "_options",
				"type": "string[][]"
			},
			{
				"internalType": "string[]",
				"name": "_correctAnswers",
				"type": "string[]"
			}
		],
		"name": "addQuestionnaire",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_eventId",
				"type": "uint256"
			}
		],
		"name": "getQuestionnaire",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "questions",
				"type": "string[]"
			},
			{
				"internalType": "string[][]",
				"name": "options",
				"type": "string[][]"
			},
			{
				"internalType": "string[]",
				"name": "correctAnswers",
				"type": "string[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const votingContractAddress = '0xF0C0fe57E8Fa38CEeC9D951DA2C7D08b450C1570';
const votingContractABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_eventRegistryAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "finalTokens",
				"type": "uint256"
			}
		],
		"name": "FinalTokenAmountDecided",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "eventCreationTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "eventRegistry",
		"outputs": [
			{
				"internalType": "contract EventRegistry",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "eventVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "finalTokenAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_eventId",
				"type": "uint256"
			}
		],
		"name": "getEventDetailsWithFinalTokenAmount",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "time",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "venue",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "finalTokens",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_eventId",
				"type": "uint256"
			}
		],
		"name": "getRemainingTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "remainingTime",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_eventId",
				"type": "uint256"
			}
		],
		"name": "getTotalVotesForEvent",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_eventId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_voter",
				"type": "address"
			}
		],
		"name": "getVotesForToken",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "votes",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "hasVoted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "tokenTotalVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "tokenVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_eventId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_tokens",
				"type": "uint256"
			}
		],
		"name": "vote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];
  
const CreateQuestionnaire = () => {
    const { eventId } = useParams();
    const [eventDetails, setEventDetails] = useState(null);

    // Form state
    const [question1, setQuestion1] = useState('');
    const [answer1A, setAnswer1A] = useState('');
    const [answer1B, setAnswer1B] = useState('');
    const [correctAnswer1, setCorrectAnswer1] = useState('');

    const [question2, setQuestion2] = useState('');
    const [answer2A, setAnswer2A] = useState('');
    const [answer2B, setAnswer2B] = useState('');
    const [correctAnswer2, setCorrectAnswer2] = useState('');

    const signer = provider.getSigner();
    const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const details = await votingContract.getEventDetailsWithFinalTokenAmount(eventId);
                setEventDetails({
                    eventId: eventId,
                    name: details[0],
                    time: details[1].toNumber(),
                    venue: details[2],
                    ipfsHash: details[3],
                    description: details[4],
                    finalTokens: details[5].toNumber(),
                });
            } catch (error) {
                console.error('Error fetching event details:', error);
            }
        };

        fetchEventDetails();
    }, [eventId]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const questions = [question1, question2];
            const options = [
                [answer1A, answer1B],
                [answer2A, answer2B],
            ];
            const correctAnswers = [correctAnswer1, correctAnswer2];

            const questionnaireContract = new ethers.Contract(
                questionnaireContractAddress,
                questionnaireContractABI,
                signer
            );

            await questionnaireContract.addQuestionnaire(eventId, questions, options, correctAnswers);

            // Optionally, you can reset the form state after successful submission
            setQuestion1('');
            setAnswer1A('');
            setAnswer1B('');
            setCorrectAnswer1('');
            setQuestion2('');
            setAnswer2A('');
            setAnswer2B('');
            setCorrectAnswer2('');
        } catch (error) {
            console.error('Error submitting questionnaire:', error);
        }
    };

    if (!eventDetails) {
        return <p>Loading...</p>;
    }

    return (
        <div className="relative">
            <Navbar />
            <div className="flex items-center">
                <Link to="/createdlist" className="text-blue-500 ml-4 mt-2 text-sm font-medium flex items-center">
                    <FiArrowLeft className="h-5 w-5 mr-1" />
                    Back to Created Event List
                </Link>
            </div>
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Create Questionnaire</h3>
            <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
                <img src={`${eventDetails.ipfsHash}`} alt={eventDetails.name} className="w-full h-96 object-cover mb-4 rounded-lg" />
                <p className="text-lg font-semibold text-gray-800">Event ID: {eventDetails.eventId}</p>
                <p className="mt-1 text-gray-600">Name: {eventDetails.name}</p>
                <p className="mt-1 text-gray-600">Token Reward: {eventDetails.finalTokens === 0 ? 5 : eventDetails.finalTokens}</p>

                <form
                    onSubmit={handleSubmit}
                    className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md"
                >
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="question1">
                            Question 1:
                        </label>
                        <input
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                            type="text"
                            id="question1"
                            placeholder="Enter Question 1"
                            value={question1}
                            onChange={(e) => setQuestion1(e.target.value)}
                        />
                        <input
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                            type="text"
                            placeholder="Enter Answer 1A"
                            value={answer1A}
                            onChange={(e) => setAnswer1A(e.target.value)}
                        />
                        <input
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                            type="text"
                            placeholder="Enter Answer 1B"
                            value={answer1B}
                            onChange={(e) => setAnswer1B(e.target.value)}
                        />
                        <select
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                            value={correctAnswer1}
                            onChange={(e) => setCorrectAnswer1(e.target.value)}
                        >
                            <option value="">Select Correct Answer</option>
                            <option value="1A">1A</option>
                            <option value="1B">1B</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="question2">
                            Question 2:
                        </label>
                        <input
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                            type="text"
                            id="question2"
                            placeholder="Enter Question 2"
                            value={question2}
                            onChange={(e) => setQuestion2(e.target.value)}
                        />
                        <input
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                            type="text"
                            placeholder="Enter Answer 2A"
                            value={answer2A}
                            onChange={(e) => setAnswer2A(e.target.value)}
                        />
                        <input
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                            type="text"
                            placeholder="Enter Answer 2B"
                            value={answer2B}
                            onChange={(e) => setAnswer2B(e.target.value)}
                        />
                        <select
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
                            value={correctAnswer2}
                            onChange={(e) => setCorrectAnswer2(e.target.value)}
                        >
                            <option value="">Select Correct Answer</option>
                            <option value="2A">2A</option>
                            <option value="2B">2B</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <button
                            className="w-full bg-[#002D74] text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Create Questionnaire
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateQuestionnaire;