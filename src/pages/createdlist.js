import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Collapsible from 'react-collapsible';
import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract';
import { votingContractAddress, votingContractABI } from '../Address&Abi/VotingContract';
import { questionnaireContractAddress, questionnaireContractABI } from '../Address&Abi/QuestionnaireContract';

const provider = new ethers.providers.Web3Provider(window.ethereum);

const CreatedList = () => {
    const [createdEvents, setCreatedEvents] = useState([]); 
    const [dueOrVotedEvents, setDueOrVotedEvents] = useState([]);
    const [questionnaireStatus, setQuestionnaireStatus] = useState({});
    const [signerAddress, setSignerAddress] = useState('');
    const [activeTab, setActiveTab] = useState('pending');
  
    const signer = provider.getSigner();
    const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);
    const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
    const questionnaireContract = new ethers.Contract(questionnaireContractAddress, questionnaireContractABI, signer);

    useEffect(() => {
        fetchCreatedEvents();

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
    }, []);
    
    const fetchCreatedEvents = async () => {
        try {
            if (!window.ethereum) {
                console.error('MetaMask not found.');
                return;
            }
    
            const userAddress = await signer.getAddress();
            if (!userAddress) {
                console.error('Current user address not available.');
                return;
            }
    
            const eventsCreatedByCurrentUser = await eventRegistryContract.getEventsCreatedByUser(userAddress);
    
            const questionnaireStatuses = await Promise.all(
                eventsCreatedByCurrentUser.map(async (event) => {
                    const hasQuestionnaire = await questionnaireContract.hasQuestionnaire(event.eventId);
                    return hasQuestionnaire;
                })
            );
    
            const eventsWithDetails = await Promise.all(
                eventsCreatedByCurrentUser.map(async (event) => {
                    const remainingTime = await votingContract.getRemainingTime(event.eventId);
                    const totalVotes = await votingContract.getTotalVotesForEvent(event.eventId);
                    const finalTokens = await votingContract.getEventFinalTokens(event.eventId);
                    const questionnairStatus = questionnaireStatuses[event.eventId];
    
                    return {
                        eventId: event.eventId,
                        name: event.name,
                        time: event.time,
                        venue: event.venue,
                        ipfsHash: event.ipfsHash,
                        description: event.description,
                        remainingTime: remainingTime.toNumber(),
                        totalVotes: totalVotes.toNumber(),
                        finalTokens: finalTokens.toNumber(),
                        hasQuestionnaire: questionnairStatus,
                    };
                })
            );
    
            setCreatedEvents(eventsWithDetails);
            setQuestionnaireStatus(questionnaireStatuses);
        } catch (error) {
            console.error('Error fetching created events:', error);
        }
    };

    return (
        <div>
            <Navbar signerAddress={signerAddress} />
            <div className="bg-gray-100 py-4 shadow">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">Created Event List</h3>
                    <div className="flex justify-center space-x-4 border-b border-gray-300">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`px-4 py-2 font-semibold uppercase ${activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-blue-500'}`}
                        >
                            PENDING EVENTS
                        </button>
                        <button
                            onClick={() => setActiveTab('created')}
                            className={`px-4 py-2 font-semibold uppercase ${activeTab === 'created' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-blue-500'}`}
                        >
                            CREATED EVENTS
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={`px-4 py-2 font-semibold uppercase ${activeTab === 'past' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-blue-500'}`}
                        >
                            PAST EVENTS
                        </button>
                    </div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            </div>
        </div>
    );
};

export default CreatedList;
