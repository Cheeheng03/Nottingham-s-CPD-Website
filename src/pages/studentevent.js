import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Collapsible from 'react-collapsible';
import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract'
import { votingContractAddress, votingContractABI } from '../Address&Abi/VotingContract'

const provider = new ethers.providers.Web3Provider(window.ethereum);

const StudentEvents = () => {
    const [createdEvents, setCreatedEvents] = useState([]);
    const [openEvents, setOpenEvents] = useState([]);
    const [enrolledEvents, setEnrolledEvents] = useState([]);
	const [pastEvents, setPastEvents] = useState([]);
	const [signerAddress, setSignerAddress] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const signer = provider.getSigner();
                const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);
                const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
                const events = await eventRegistryContract.getActiveEvents();
                const eventsWithTokens = await Promise.all(
                    events.map(async (event) => {
                        const remainingTime = await votingContract.getRemainingTime(event.eventId);
                        const userHasEnrolled = await eventRegistryContract.hasEnrolled(event.eventId, signer.getAddress());
                        const finalTokens = await votingContract.getEventFinalTokens(event.eventId);
                        const currentTime = new Date().getTime();
                        const eventTime = event.time * 1000;
                        let status = '';
                        if (currentTime < eventTime) {
                            status = 'Active';
                        } else {
                            status = 'Past';
                        }
                        return {
                            eventId: event.eventId,
                            name: event.name,
                            time: event.time,
                            venue: event.venue,
                            ipfsHash: event.ipfsHash,
                            description: event.description,
                            finalTokens: finalTokens.toNumber(),
                            remainingTime: remainingTime.toNumber(),
                            hasEnrolled: userHasEnrolled,
                            status: status
                        };
                    })
                );
                const enrolledEventsDetails = eventsWithTokens.filter(event => event.hasEnrolled);
                const openEventsDetails = eventsWithTokens.filter(event => !event.hasEnrolled && event.status === 'Active');
                const pastEventsDetails = eventsWithTokens.filter(event => event.status === 'Past');
                
                setEnrolledEvents(enrolledEventsDetails);
                setOpenEvents(openEventsDetails);
                setPastEvents(pastEventsDetails);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        }

        fetchData();

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

    return (
        <div>
            <Navbar signerAddress={signerAddress} />
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Student Events List</h3>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="collapsible-container">
                    <Collapsible trigger={<div className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4">Events Open for Enrollment</div>} transitionTime={200}>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                            {openEvents.map((event, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                                    <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-64 sm:h-72 object-cover" />
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
                                            <p className="mt-1 text-gray-600">Name: {event.name}</p>
                                            <p className="mt-1 text-gray-600">Time: {new Date(event.time * 1000).toLocaleString()}</p>
                                            <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                                            <p className="mt-1 text-gray-600">Description: {event.description}</p>
                                            <p className="mt-1 text-gray-600">Tokens Rewarded: {event.finalTokens === 0 ? 5 : event.finalTokens}</p>
                                        </div>
                                        <Link
                                            to={`/enroll/${event.eventId}`}
                                            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4 text-center"
                                        >
                                            View
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Collapsible>
                </div>

                <div className="collapsible-container mt-4">
                    <Collapsible trigger={<div className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4">Enrolled Events</div>} transitionTime={200}>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                            {enrolledEvents.map((event, index) => (
                                <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                                    <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-64 sm:h-72 object-cover" />
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div>
                                            <p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
                                            <p className="mt-1 text-gray-600">Name: {event.name}</p>
                                            <p className="mt-1 text-gray-600">Time: {new Date(event.time * 1000).toLocaleString()}</p>
                                            <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                                            <p className="mt-1 text-gray-600">Description: {event.description}</p>
                                            <p className="mt-1 text-gray-600">Tokens Rewarded: {event.finalTokens === 0 ? 5 : event.finalTokens}</p>
                                        </div>
                                        <Link
                                            to={`/enroll/${event.eventId}`}
                                            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4 text-center"
                                        >
                                            View
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
                                            <p className="mt-1 text-gray-600">Time: {new Date(event.time * 1000).toLocaleString()}</p>
                                            <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                                            <p className="mt-1 text-gray-600">Description: {event.description}</p>
                                            <p className="mt-1 text-gray-600">Tokens Rewarded: {event.finalTokens === 0 ? 5 : event.finalTokens}</p>
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

export default StudentEvents;