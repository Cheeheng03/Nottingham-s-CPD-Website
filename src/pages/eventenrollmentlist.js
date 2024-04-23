/*
 * Source code written by SEGP Group P
 * EventEnrollmentList component for managing event enrollment for Nottingham s-CPD website
 * External libraries used: react, ethers, react-router-dom, react-collapsible
 */

import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Collapsible from 'react-collapsible';
import oops from '../Images/oops.gif'
import { FaArrowAltCircleRight } from 'react-icons/fa';
import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract'
import { votingContractAddress, votingContractABI } from '../Address&Abi/VotingContract'

const EventEnrollmentList = () => {
    // State variables for managing event data and user interaction
    const [openEvents, setOpenEvents] = useState([]);
    const [enrolledEvents, setEnrolledEvents] = useState([]);
	const [pastEvents, setPastEvents] = useState([]);
	const [signerAddress, setSignerAddress] = useState('');
    const [isEnrollableEventsOpen, setIsEnrollableEventsOpen] = useState(true);
    const [isEnrolledEventsOpen, setIsEnrolledEventsOpen] = useState(false);
    const [isPastEventsOpen, setIsPastEventsOpen] = useState(false);
    // Refs for scroll handling
    const enrollableEventsRef = useRef(null);
    const enrolledEventsRef = useRef(null);
    const pastEventsRef = useRef(null);
    // Ethereum provider setup
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // Fetch event data and user address on component mount
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
                        const totalVotesForEvent =  await votingContract.tokenTotalVotes(event.eventId, 5) +
                                                    await votingContract.tokenTotalVotes(event.eventId, 10) +
                                                    await votingContract.tokenTotalVotes(event.eventId, 15);

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
                            status: status,
                            totalvotes: totalVotesForEvent
                        };
                    })
                );
                const enrolledEventsDetails = eventsWithTokens.filter(event => event.hasEnrolled);
                const openEventsDetails = eventsWithTokens.filter(event => !event.hasEnrolled && event.status === 'Active' && (event.remainingTime <= 0 || event.totalvotes > 0));
                const pastEventsDetails = eventsWithTokens.filter(event => event.status === 'Past');
                
                setEnrolledEvents(enrolledEventsDetails);
                setOpenEvents(openEventsDetails);
                setPastEvents(pastEventsDetails);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        }
    
        fetchData();
    
        // Function to fetch signer's Ethereum address
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
    }, [provider]);
    
    // Function to handle horizontal scrolling
    useEffect(() => {
        function handleWheelScroll(event) {
            const delta = Math.max(-1, Math.min(1, event.deltaY));
            event.currentTarget.scrollLeft -= delta * 100;
            event.preventDefault();
        }
    
        const enrollableEventsRefCurrent = enrollableEventsRef.current;
        const enrolledEventsRefCurrent = enrolledEventsRef.current;
        const pastEventsRefCurrent = pastEventsRef.current;
    
        if (enrollableEventsRefCurrent) {
            enrollableEventsRefCurrent.addEventListener('wheel', handleWheelScroll);
        }
        if (enrolledEventsRefCurrent) {
            enrolledEventsRefCurrent.addEventListener('wheel', handleWheelScroll);
        }
        if (pastEventsRefCurrent) {
            pastEventsRefCurrent.addEventListener('wheel', handleWheelScroll);
        }
    
        return () => {
            if (enrollableEventsRefCurrent) {
                enrollableEventsRefCurrent.removeEventListener('wheel', handleWheelScroll);
            }
            if (enrolledEventsRefCurrent) {
                enrolledEventsRefCurrent.removeEventListener('wheel', handleWheelScroll);
            }
            if (pastEventsRefCurrent) {
                pastEventsRefCurrent.removeEventListener('wheel', handleWheelScroll);
            }
        };
    }, [enrollableEventsRef, enrolledEventsRef, pastEventsRef]);

    // Render the EventEnrollmentList component UI
    return (
        <div>
            {/* Render Navbar component with signer address */}
            <Navbar signerAddress={signerAddress} />
            {/* Render title */}
            <h3 className="text-4xl font-bold text-center text-[#0b287b] mt-4 mb-8">Event Enrollment</h3>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Render Collapsible container for open events */}
                <div className="collapsible-container mt-4">
                    <Collapsible
                        trigger={
                            <div className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4 flex justify-between items-center" onClick={() => setIsEnrollableEventsOpen(!isEnrollableEventsOpen)}>
                                <span className='w-full'>Open Events</span>
                                <div className={`transform transition-transform ${isEnrollableEventsOpen ? 'rotate-90' : 'rotate-0'}`}>
                                    <FaArrowAltCircleRight size={24} />
                                </div>
                            </div>
                        }
                        open={isEnrollableEventsOpen}
                        transitionTime={200}
                    >
                        {/* Render list of open events */}
                        <div className="flex flex-nowrap overflow-x-auto py-4" ref={enrollableEventsRef}>
                            {openEvents.length === 0 ? (
                                <div className="flex justify-center items-center h-full w-full">
                                    <div className="text-center">
                                        <img src={oops} alt="Oops Image" className="mb-2 h-52 mx-auto" />
                                        <p className="text-gray-600">Apologies, there are currently no events available for enrollment. Feel free to join our upcoming events!</p>
                                    </div>
                                </div>
                            ) : (
                                openEvents.map((event, index) => (
                                    <div key={index} className="flex-none w-full sm:w-1/2 lg:w-1/3 px-4">
                                        <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
                                            <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-64 object-cover" />
                                            <div className="flex-1 p-4 flex flex-col justify-between">
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
                                                    <p className="mt-1 text-gray-600">Name: {event.name}</p>
                                                    <p className="mt-1 text-gray-600">Time: {new Date(event.time * 1000).toLocaleString()}</p>
                                                    <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                                                    <p className="mt-1 text-gray-600">Description: {event.description}</p>
                                                    <p className="mt-1 text-gray-600">Tokens Rewarded: {event.finalTokens === 0 ? 5 : event.finalTokens}</p>
                                                </div>
                                                <Link to={`/enroll/${event.eventId}`} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4 text-center block">
                                                    Enroll
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Collapsible>
                </div>
                
                {/* Render Collapsible container for enrolled events */}
                <div className="collapsible-container mt-4">
                    <Collapsible
                        trigger={
                            <div className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4 flex justify-between items-center" onClick={() => setIsEnrolledEventsOpen(!isEnrolledEventsOpen)}>
                                <span className='w-full'>Enrolled Events</span>
                                <div className={`transform transition-transform ${isEnrolledEventsOpen ? 'rotate-90' : 'rotate-0'}`}>
                                    <FaArrowAltCircleRight size={24} />
                                </div>
                            </div>
                        }
                        open={isEnrolledEventsOpen}
                        transitionTime={200}
                    >
                        {/* Render list of enrolled events */}
                        <div className="flex flex-nowrap overflow-x-auto py-4" ref={enrolledEventsRef}>
                            {enrolledEvents.length === 0 ? (
                                <div className="flex justify-center items-center h-full w-full">
                                    <div className="text-center">
                                        <img src={oops} alt="Oops Image" className="mb-2 h-52 mx-auto" />
                                        <p className="text-gray-600">Apologies, there are currently no events available for enrollment. Feel free to join our upcoming events!</p>
                                    </div>
                                </div>
                            ) : (
                                enrolledEvents.map((event, index) => (
                                    <div key={index} className="flex-none w-full sm:w-1/2 lg:w-1/3 px-4">
                                        <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full flex flex-col">
                                            <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-64 object-cover" />
                                            <div className="flex-1 p-4 flex flex-col justify-between">
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
                                                    <p className="mt-1 text-gray-600">Name: {event.name}</p>
                                                    <p className="mt-1 text-gray-600">Time: {new Date(event.time * 1000).toLocaleString()}</p>
                                                    <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                                                    <p className="mt-1 text-gray-600">Description: {event.description}</p>
                                                    <p className="mt-1 text-gray-600">Tokens Rewarded: {event.finalTokens === 0 ? 5 : event.finalTokens}</p>
                                                </div>
                                                <Link to={`/enroll/${event.eventId}`} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4 text-center block">
                                                    View
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Collapsible>
                </div>
                
                {/* Render Collapsible container for past events */}
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
                        {/* Render list of past events */}
                        <div className="flex flex-nowrap overflow-x-auto py-4" ref={pastEventsRef}>
                            {pastEvents.length === 0 ? (
                                <div className="flex justify-center items-center h-full w-full">
                                    <div className="text-center">
                                        <img src={oops} alt="Oops Image" className="mb-2 h-52 mx-auto" />
                                        <p className="text-gray-600">Apologies, there are currently no events available for enrollment. Feel free to join our upcoming events!</p>
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
                                                    <p className="mt-1 text-gray-600">Time: {new Date(event.time * 1000).toLocaleString()}</p>
                                                    <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                                                    <p className="mt-1 text-gray-600">Description: {event.description}</p>
                                                    <p className="mt-1 text-gray-600">Tokens Rewarded: {event.finalTokens === 0 ? 5 : event.finalTokens}</p>
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

export default EventEnrollmentList;
