import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract'
import { votingContractAddress, votingContractABI } from '../Address&Abi/VotingContract'

const provider = new ethers.providers.Web3Provider(window.ethereum);

const StudentEvents = () => {
    const [openEvents, setOpenEvents] = useState([]);
    const [enrolledEvents, setEnrolledEvents] = useState([]);
    const [pastEvents, setPastEvents] = useState([]);
    const [activeTab, setActiveTab] = useState('open');
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

    const renderEventCards = (events) => {
        return events.map((event, index) => (
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
                        View
                    </Link>
                </div>
            </div>
        ));
    };

    return (
        <div>
            <Navbar signerAddress={signerAddress} />
            <div className="bg-gray-100 py-4 shadow">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">Student Events List</h3>
                    <div className="flex justify-center space-x-4 border-b border-gray-300">
                        <div className="flex space-x-2">
                            <button onClick={() => setActiveTab('open')} className={`px-4 py-2 uppercase font-semibold ${activeTab === 'open' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-blue-500'}`}>Open for Enrollment</button>
                            <button onClick={() => setActiveTab('enrolled')} className={`px-4 py-2 uppercase font-semibold ${activeTab === 'enrolled' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-blue-500'}`}>Enrolled</button>
                            <button onClick={() => setActiveTab('past')} className={`px-4 py-2 uppercase font-semibold ${activeTab === 'past' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-blue-500'}`}>Past</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            </div>
        </div>
    );
};

export default StudentEvents;
