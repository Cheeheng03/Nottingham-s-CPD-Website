import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Collapsible from 'react-collapsible';
import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract'
import { votingContractAddress, votingContractABI } from '../Address&Abi/VotingContract'
import { questionnaireContractAddress, questionnaireContractABI } from '../Address&Abi/QuestionnaireContract'

const provider = new ethers.providers.Web3Provider(window.ethereum);


const CreatedList = () => {
    const [createdEvents, setCreatedEvents] = useState([]); 
    const [dueOrVotedEvents, setDueOrVotedEvents] = useState([]);
    const [questionnaireStatus, setQuestionnaireStatus] = useState({});
	const [signerAddress, setSignerAddress] = useState('');
  
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
                    const exists = await questionnaireContract.questionnaireExists(event.eventId);
                    return { eventId: event.eventId, exists };
                })
            );
    
            const statusMap = {};
            questionnaireStatuses.forEach(status => {
                statusMap[status.eventId] = status.exists;
            });
    
            setQuestionnaireStatus(statusMap);
    
            const eventsWithVotes = await Promise.all(
                eventsCreatedByCurrentUser.map(async (event) => {
                    const totalVotes = await votingContract.getTotalVotesForEvent(event.eventId);
                    const remainingTime = await votingContract.getRemainingTime(event.eventId);
                    const userHasVoted = totalVotes > 0 || remainingTime <= 0;
                    return { ...event, remainingTime: remainingTime.toString(), hasVoted: userHasVoted, totalVotes };
                })
            );
    
            setCreatedEvents(eventsWithVotes);
            setDueOrVotedEvents(eventsWithVotes.filter(event => !questionnaireStatus[event.eventId]));
    
        } catch (error) {
            console.error('Error fetching created events:', error);
        }
    };

	const currentTime = new Date().getTime();

	const pendingEvents = createdEvents.filter(event => {
		return (
			dueOrVotedEvents.includes(event) &&
			event.time.mul(1000).toNumber() > currentTime &&
			!questionnaireStatus[event.eventId]
		);
	});

	const createdEventsList = createdEvents.filter(event => {
		return (
			dueOrVotedEvents.includes(event) &&
			event.time.mul(1000).toNumber() > currentTime &&
			questionnaireStatus[event.eventId]
		);
	});
	
	const pastEvents = createdEvents.filter(event => {
		return (
			event.time.mul(1000).toNumber() < currentTime
		);
	});
	
    
	return (
        <div>
            <Navbar signerAddress={signerAddress} />
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Created Events List</h3>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="collapsible-container">
                    <Collapsible trigger={<div className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4">Pending Events</div>} transitionTime={200}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                            {pendingEvents.map((event, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                                    <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-64 sm:h-72 object-cover" />
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
                                            <p className="mt-1 text-gray-600">Name: {event.name}</p>
                                            <p className="mt-1 text-gray-600">Time: {new Date(event.time.mul(1000).toNumber()).toLocaleString()}</p>
                                            <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                                            <p className="mt-1 text-gray-600">Description: {event.description}</p>
                                        </div>
										<Link
											to={`/questionnaire/${event.eventId}`}
											className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4 text-center"
										>
											Create Questionnaire
										</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Collapsible>
                </div>

                <div className="collapsible-container mt-4">
                    <Collapsible trigger={<div className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4">Created Events</div>} transitionTime={200}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                            {createdEventsList.map((event, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                                    <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-64 sm:h-72 object-cover" />
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
                                            <p className="mt-1 text-gray-600">Name: {event.name}</p>
                                            <p className="mt-1 text-gray-600">Time: {new Date(event.time.mul(1000).toNumber()).toLocaleString()}</p>
                                            <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                                            <p className="mt-1 text-gray-600">Description: {event.description}</p>
                                        </div>
                                        <Link
											to={`/editquestionnaire/${event.eventId}`}
											className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4 text-center"
										>
											Edit Questionnaire
										</Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Collapsible>
                </div>

				<div className="collapsible-container mt-4">
                    <Collapsible trigger={<div className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4">Past Events</div>} transitionTime={200}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                            {pastEvents.map((event, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                                    <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-64 sm:h-72 object-cover" />
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
                                            <p className="mt-1 text-gray-600">Name: {event.name}</p>
                                            <p className="mt-1 text-gray-600">Time: {new Date(event.time.mul(1000).toNumber()).toLocaleString()}</p>
                                            <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                                            <p className="mt-1 text-gray-600">Description: {event.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Collapsible>
                </div>
            </div>
        </div>
    );
  };
  
  export default CreatedList;
