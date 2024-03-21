import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Collapsible from 'react-collapsible';
import oops from '../Images/oops.gif'
import { FaArrowAltCircleRight } from 'react-icons/fa';
import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract'
import { votingContractAddress, votingContractABI } from '../Address&Abi/VotingContract'
import { questionnaireContractAddress, questionnaireContractABI } from '../Address&Abi/QuestionnaireContract'

const CreatedList = () => {
    const [createdEvents, setCreatedEvents] = useState([]); 
    const [dueOrVotedEvents, setDueOrVotedEvents] = useState([]);
    const [questionnaireStatus, setQuestionnaireStatus] = useState({});
	const [signerAddress, setSignerAddress] = useState('');
    const [isPendingEventsOpen, setIsPendingEventsOpen] = useState(true);
    const [isCreatedEventsOpen, setIsCreatedEventsOpen] = useState(false);
    const [isPastEventsOpen, setIsPastEventsOpen] = useState(false);
    const pendingEventsRef = useRef(null);
    const createdEventsRef = useRef(null);
    const pastEventsRef = useRef(null);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
  
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
	
    useEffect(() => {
        function handleWheelScroll(event) {
            const delta = Math.max(-1, Math.min(1, event.deltaY));
            event.currentTarget.scrollLeft -= delta * 100;
            event.preventDefault();
        }

        if (pendingEventsRef.current) {
            pendingEventsRef.current.addEventListener('wheel', handleWheelScroll);
        }
        if (createdEventsRef.current) {
            createdEventsRef.current.addEventListener('wheel', handleWheelScroll);
        }
        if (pastEventsRef.current) {
            pastEventsRef.current.addEventListener('wheel', handleWheelScroll);
        }

        return () => {
            if (pendingEventsRef.current) {
                pendingEventsRef.current.removeEventListener('wheel', handleWheelScroll);
            }
            if (createdEventsRef.current) {
                createdEventsRef.current.removeEventListener('wheel', handleWheelScroll);
            }
            if (pastEventsRef.current) {
                pastEventsRef.current.removeEventListener('wheel', handleWheelScroll);
            }
        };
    }, []);
    
	return (
        <div>
            <Navbar signerAddress={signerAddress} />
            <h3 className="text-4xl font-bold text-center text-[#0b287b] mt-4 mb-8">Questionnaire Creation</h3>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="collapsible-container mt-4">
                    <Collapsible
                        trigger={
                            <div className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4 flex justify-between items-center" onClick={() => setIsPendingEventsOpen(!isPendingEventsOpen)}>
                                <span className='w-full'>Pending Events</span>
                                <div className={`transform transition-transform ${isPendingEventsOpen ? 'rotate-90' : 'rotate-0'}`}>
                                    <FaArrowAltCircleRight size={24} />
                                </div>
                            </div>
                        }
                        open={isPendingEventsOpen}
                        transitionTime={200}
                    >
                       <div className="flex flex-nowrap overflow-x-auto py-4" ref={pendingEventsRef}>
                            {pendingEvents.length === 0 ? (
                                <div className="flex justify-center items-center h-full w-full">
                                <div className="text-center">
                                    <img src={oops} alt="Oops Image" className="mb-2 h-52 mx-auto" />
                                    <p className="text-gray-600">Apologies, there are currently no questionnaire pending. Feel free to create an event!</p>
                                </div>
                            </div>
                            
                            
                            ) : (
                                pendingEvents.map((event, index) => (
                                    <div key={index} className="flex-none w-full sm:w-1/2 lg:w-1/3 px-4">
                                        <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
                                            <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-64 object-cover" />
                                            <div className="flex-1 p-4 flex flex-col justify-between">
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
                                                    <p className="mt-1 text-gray-600">Name: {event.name}</p>
                                                    <p className="mt-1 text-gray-600">Time: {new Date(event.time.mul(1000).toNumber()).toLocaleString()}</p>
                                                    <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                                                    <p className="mt-1 text-gray-600">Description: {event.description}</p>
                                                </div>
                                                <Link to={`/questionnaire/${event.eventId}`} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4 text-center block">
                                                    Create Questionnaire
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Collapsible>
                </div>

                <div className="collapsible-container mt-4">
                    <Collapsible
                        trigger={
                            <div className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4 flex justify-between items-center" onClick={() => setIsCreatedEventsOpen(!isCreatedEventsOpen)}>
                                <span className='w-full'>Created Events</span>
                                <div className={`transform transition-transform ${isCreatedEventsOpen ? 'rotate-90' : 'rotate-0'}`}>
                                    <FaArrowAltCircleRight size={24} />
                                </div>
                            </div>
                        }
                        open={isCreatedEventsOpen}
                        transitionTime={200}
                    >
                       <div className="flex flex-nowrap overflow-x-auto py-4" ref={createdEventsRef}>
                            {createdEventsList.length === 0 ? (
                                <div className="flex justify-center items-center h-full w-full">
                                <div className="text-center">
                                    <img src={oops} alt="Oops Image" className="mb-2 h-52 mx-auto" />
                                    <p className="text-gray-600">Apologies, there are currently no questionnaire created. Feel free to create an event!</p>
                                </div>
                            </div>
                            
                            
                            ) : (
                                createdEventsList.map((event, index) => (
                                    <div key={index} className="flex-none w-full sm:w-1/2 lg:w-1/3 px-4">
                                        <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
                                            <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-64 object-cover" />
                                            <div className="flex-1 p-4 flex flex-col justify-between">
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
                                                    <p className="mt-1 text-gray-600">Name: {event.name}</p>
                                                    <p className="mt-1 text-gray-600">Time: {new Date(event.time.mul(1000).toNumber()).toLocaleString()}</p>
                                                    <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                                                    <p className="mt-1 text-gray-600">Description: {event.description}</p>
                                                </div>
                                                <Link to={`/editquestionnaire/${event.eventId}`} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4 text-center block">
                                                    Edit Questionnaire
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Collapsible>
                </div>

                <div className="collapsible-container mt-4">
                    <Collapsible
                        trigger={
                        <div className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4 flex justify-between items-center" onClick={() => setIsPastEventsOpen(!isPastEventsOpen)}>
                                <span className='w-full'>Past Events</span>
                                <div className={`transform transition-transform ${isPastEventsOpen ? 'rotate-90' : 'rotate-0'}`}>
                                    <FaArrowAltCircleRight size={24} />
                                </div>
                            </div>
                        }
                        open={isPastEventsOpen}
                        transitionTime={200}
                    >
                       <div className="flex flex-nowrap overflow-x-auto py-4" ref={pastEventsRef}>
                            {pastEvents.length === 0 ? (
                                <div className="flex justify-center items-center h-full w-full">
                                <div className="text-center">
                                    <img src={oops} alt="Oops Image" className="mb-2 h-52 mx-auto" />
                                    <p className="text-gray-600">Apologies, there are currently no questionnaire created. Feel free to create an event!</p>
                                </div>
                            </div>
                                             
                            ) : (
                                pastEvents.map((event, index) => (
                                    <div key={index} className="flex-none w-full sm:w-1/2 lg:w-1/3 px-4">
                                        <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
                                            <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-64 object-cover" />
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
                                    </div>
                                ))
                            )}
                        </div>
                    </Collapsible>
                </div>
            </div>
        </div>
    );
  };
  
  export default CreatedList;