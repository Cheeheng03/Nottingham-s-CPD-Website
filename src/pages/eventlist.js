import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Collapsible from 'react-collapsible';
import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract'
import { votingContractAddress, votingContractABI } from '../Address&Abi/VotingContract'

const provider = new ethers.providers.Web3Provider(window.ethereum);

const EventList = () => {
    const [eventsList, setEventsList] = useState([]);
	const [tokensWorth, setTokensWorth] = useState(5);
	const [signerAddress, setSignerAddress] = useState('');

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
			return remainingTime.toNumber(); // Convert BigNumber to number
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

	return (
		<div>
			<Navbar signerAddress={signerAddress} />
			<h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Events List</h3>
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
										{!event.hasVoted && (
											<Link to={`/vote/${event.eventId}`} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4 text-center">
												Vote
											</Link>
										)}
									</div>
								</div>
							))}
						</div>
					</Collapsible>
				</div>
	
				<div className="collapsible-container mt-4">
					<Collapsible trigger={<div className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4">Voted or Due Events</div>} transitionTime={200}>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
							{votedOrDueEvents.map((event, index) => (
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
										{event.hasVoted ? (
											<p className="mt-1 text-gray-600">Status: Voted</p>
										) : (
											<>
												{event.remainingTime <= 0 ? (
													<p className="mt-1 text-gray-600">Status: Due</p>
												) : (
													<Link to={`/vote/${event.eventId}`} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4 text-center">
														Vote
													</Link>
												)}
											</>
										)}
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

export default EventList;