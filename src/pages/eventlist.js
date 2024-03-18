import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const EventList = () => {
    const [openEvents, setOpenEvents] = useState([]);
    const [enrolledEvents, setEnrolledEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('open');
    const [signerAddress, setSignerAddress] = useState('');

    useEffect(() => {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        async function fetchData() {
            try {
                const signer = provider.getSigner();
                // Your contract addresses and ABIs
                const eventRegistryContractAddress = 'YOUR_EVENT_REGISTRY_CONTRACT_ADDRESS';
                const eventRegistryContractABI = 'YOUR_EVENT_REGISTRY_CONTRACT_ABI';
                const votingContractAddress = 'YOUR_VOTING_CONTRACT_ADDRESS';
                const votingContractABI = 'YOUR_VOTING_CONTRACT_ABI';

                const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);
                const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);

                const events = await eventRegistryContract.getActiveEvents();
                const currentTime = new Date().getTime();

                const eventsWithDetails = await Promise.all(events.map(async (event) => {
                    const remainingTime = await votingContract.getRemainingTime(event.eventId);
                    const userHasEnrolled = await eventRegistryContract.hasEnrolled(event.eventId, signer.getAddress());
                    const finalTokens = await votingContract.getEventFinalTokens(event.eventId);
                    const eventTime = event.time * 1000;
                    let status = currentTime < eventTime ? 'Active' : 'Past';

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
                }));

                setOpenEvents(eventsWithDetails.filter(event => !event.hasEnrolled && event.status === 'Active'));
                setEnrolledEvents(eventsWithDetails.filter(event => event.hasEnrolled));
                setPastEvents(eventsWithDetails.filter(event => event.status === 'Past'));
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
            <div className="bg-gray-100 py-4 shadow">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">Events List</h3>
                    <div className="flex justify-center space-x-4 border-b border-gray-300">
                        <button
                            onClick={() => setActiveTab('open')}
                            className={`px-4 py-2 font-semibold uppercase ${activeTab === 'open' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-blue-500'}`}
                        >
                            OPEN FOR ENROLLMENT
                        </button>
                        <button
                            onClick={() => setActiveTab('enrolled')}
                            className={`px-4 py-2 font-semibold uppercase ${activeTab === 'enrolled' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-blue-500'}`}
                        >
                            ENROLLED
                        </button>
                        <button
                            onClick={() => setActiveTab('past')}
                            className={`px-4 py-2 font-semibold uppercase ${activeTab === 'past' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-blue-500'}`}
                        >
                            PAST
                        </button>
                    </div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                    {activeTab === 'open' && openEvents.map((event, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                            <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-64 sm:h-72 object-cover" />
                            <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                    <p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
                                    <p className="mt-1 text-gray-600">Name: {event.name}</p>
                                    <p className="mt-1 text-gray-600">Time: {new Date(event.time * 1000).toLocaleString()}</p>
                                    <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                                    <p className="mt-1 text-gray-600">Description: {event.description}</p>
                                    <p className="mt-1 text-gray-600">Tokens Rewarded: {event.finalTokens}</p>
                                </div>
                                <Link
                                    to={`/enroll/${event.eventId}`}
                                    className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4 text-center"
                                >
                                    Enroll Now
                                </Link>
                            </div>
                        </div>
                    ))}
                    {activeTab === 'enrolled' && enrolledEvents.map((event, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                            <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-64 sm:h-72 object-cover" />
                            <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                    <p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
                                    <p className="mt-1 text-gray-600">Name: {event.name}</p>
                                    <p className="mt-1 text-gray-600">Time: {new Date(event.time * 1000).toLocaleString()}</p>
                                    <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                                    <p className="mt-1 text-gray-600">Description: {event.description}</p>
                                    <p className="mt-1 text-gray-600">Tokens Rewarded: {event.finalTokens}</p>
                                </div>
                                <Link
                                    to={`/enroll/${event.eventId}`}
                                    className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4 text-center"
                                >
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                    {activeTab === 'past' && pastEvents.map((event, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
                            <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-64 sm:h-72 object-cover" />
                            <div className="flex-1 p-4 flex flex-col justify-between">
                                <div>
                                    <p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
                                    <p className="mt-1 text-gray-600">Name: {event.name}</p>
                                    <p className="mt-1 text-gray-600">Time: {new Date(event.time * 1000).toLocaleString()}</p>
                                    <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                                    <p className="mt-1 text-gray-600">Description: {event.description}</p>
                                    <p className="mt-1 text-gray-600">Tokens Rewarded: {event.finalTokens}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EventList;
