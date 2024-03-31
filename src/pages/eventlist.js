import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Collapsible from 'react-collapsible';
import oops from '../Images/oops.gif'
import { FaArrowAltCircleRight } from 'react-icons/fa';
import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract'
import { votingContractAddress, votingContractABI } from '../Address&Abi/VotingContract'

const EventList = () => {
    const [eventsList, setEventsList] = useState([]);
	const [tokensWorth, setTokensWorth] = useState(5);
	const [signerAddress, setSignerAddress] = useState('');
	const [isPendingEventsOpen, setIsPendingEventsOpen] = useState(true);
    const [isDueEventsOpen, setIsDueEventsOpen] = useState(false);
    const pendingEventsRef = useRef(null);
    const dueEventsRef = useRef(null);
    const provider = new ethers.providers.Web3Provider(window.ethereum);


    const signer = provider.getSigner();
    const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);
    const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);

    useEffect(() => {
        fetchEvents();

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

    const fetchEvents = async () => {
		try {
			const events = await eventRegistryContract.getActiveEvents();
			const eventsWithVotes = await Promise.all(
				events.map(async (event) => {
					const remainingTime = await getRemainingTime(event.eventId);
					const userHasVoted = await getVotesForTokenFromBlockchain(event.eventId, tokensWorth) > 0;
					const status = remainingTime <= 0 ? "Due" : "Active";
					return { ...event, remainingTime: remainingTime.toString(), hasVoted: userHasVoted, status };
				})
			);
			setEventsList(eventsWithVotes);
		} catch (error) {
			console.error('Error fetching events:', error);
		}
	};
	
	const getRemainingTime = async (eventId) => {
		try {
			const remainingTime = await votingContract.getRemainingTime(eventId);
			return remainingTime.toNumber(); 
		} catch (error) {
			console.error('Error fetching remaining time for event:', error);
			return 0;
		}
	};
	
	const getVotesForTokenFromBlockchain = async (eventId, tokens) => {
		try {
			const votes = await votingContract.getVotesForToken(eventId, signer.getAddress());
			return votes;
		} catch (error) {
			console.error('Error fetching votes for token:', error);
			return 0;
		}
	};

	const pendingEvents = eventsList.filter((event) => !event.hasVoted && event.remainingTime > 0);
    const votedOrDueEvents = eventsList.filter((event) => event.hasVoted || event.remainingTime <= 0);

	useEffect(() => {
        function handleWheelScroll(event) {
            const delta = Math.max(-1, Math.min(1, event.deltaY));
            event.currentTarget.scrollLeft -= delta * 100;
            event.preventDefault();
        }

        if (pendingEventsRef.current) {
            pendingEventsRef.current.addEventListener('wheel', handleWheelScroll);
        }
        if (dueEventsRef.current) {
            dueEventsRef.current.addEventListener('wheel', handleWheelScroll);
        }

        return () => {
            if (pendingEventsRef.current) {
                pendingEventsRef.current.removeEventListener('wheel', handleWheelScroll);
            }
            if (dueEventsRef.current) {
                dueEventsRef.current.removeEventListener('wheel', handleWheelScroll);
            }
        };
    }, []);

	return (
		<div>
			<Navbar signerAddress={signerAddress} />
			<h3 className="text-4xl font-bold text-center text-[#0b287b] mt-4 mb-8">Event Voting</h3>
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
                                    <p className="text-gray-600">Apologies, there are currently no events available for voting. Feel free to create an event!</p>
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
                                                <Link to={`/vote/${event.eventId}`} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4 text-center block">
                                                    Vote
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
                            <div className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4 flex justify-between items-center" onClick={() => setIsDueEventsOpen(!isDueEventsOpen)}>
                                <span className='w-full'>Vote or Due Events</span>
                                <div className={`transform transition-transform ${isDueEventsOpen ? 'rotate-90' : 'rotate-0'}`}>
                                    <FaArrowAltCircleRight size={24} />
                                </div>
                            </div>
                        }
                        open={isDueEventsOpen}
                        transitionTime={200}
                    >
                        <div className="flex flex-nowrap overflow-x-auto py-4" ref={dueEventsRef}>
                            {votedOrDueEvents.length === 0 ? (
                                <div className="flex justify-center items-center h-full w-full">
                                <div className="text-center">
                                    <img src={oops} alt="Oops Image" className="mb-2 h-52 mx-auto" />
                                    <p className="text-gray-600">Apologies, there are currently no events voted. Feel free to create an event!</p>
                                </div>
                            </div>
                            
                            
                            ) : (
                                votedOrDueEvents.map((event, index) => (
                                    <div key={index} className="flex-none w-full sm:w-1/2 lg:w-1/3 px-4">
											<div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
												<img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-64 object-cover" />
												<div className="p-4">
												<p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
												<p className="mt-1 text-gray-600">Name: {event.name}</p>
												<p className="mt-1 text-gray-600">Time: {new Date(event.time.mul(1000).toNumber()).toLocaleString()}</p>
												<p className="mt-1 text-gray-600">Venue: {event.venue}</p>
												<p className="mt-1 text-gray-600">Description: {event.description}</p>
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

export default EventList;