/*
 * Source code written by SEGP Group P
 * TokenClaimableEventList component for displaying claimable and claimed events for Nottingham s-CPD website
 * External libraries used: react, ethers, react-router-dom, react-collapsible
 */

import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { Link } from 'react-router-dom';
import Collapsible from 'react-collapsible';
import Navbar from '../components/Navbar';
import oops from '../Images/oops.gif'
import { FaArrowAltCircleRight } from 'react-icons/fa';
import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract';
import { votingContractAddress, votingContractABI } from '../Address&Abi/VotingContract';
import { NOTTAddress, NOTTABI } from '../Address&Abi/NottinghamCoinContract';


const TokenClaimmableEventList = () => {
    // State to store claimable and claimed events
    const [enrolledAndPassedEvents, setEnrolledAndPassedEvents] = useState([]);
    // State to store signer's Ethereum address
    const [signerAddress, setSignerAddress] = useState('');
    // State to toggle visibility of claimable events
    const [isClaimableEventsOpen, setIsClaimableEventsOpen] = useState(true);
    // State to toggle visibility of claimed events
    const [isClaimedEventsOpen, setIsClaimedEventsOpen] = useState(false);
    // References for scrolling within event lists
    const claimableEventsRef = useRef(null);
    const claimedEventsRef = useRef(null);
    
    // Ethereum provider and signer setup
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    // Fetch data on component mount
    useEffect(() => {
        async function fetchData() {
            try {
                // Contracts instances
                const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);
                const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
                const NOTTContract = new ethers.Contract(NOTTAddress, NOTTABI, signer);
        
                // Fetch active events
                const events = await eventRegistryContract.getActiveEvents();
                const currentTime = new Date().getTime();
        
                const eventsWithDetails = await Promise.all(events.map(async (event) => {
                    // Fetch various details for each event
                    const hasEnrolledPromise = eventRegistryContract.hasEnrolled(event.eventId, signer.getAddress());
                    const remainingTimePromise = votingContract.getRemainingTime(event.eventId);
                    const finalTokensPromise = votingContract.getEventFinalTokens(event.eventId);
                    const address = await signer.getAddress();
                    const claimedPromise = NOTTContract.hasClaimed(event.eventId, address);
        
                    const [hasEnrolled, remainingTime, finalTokens, claimed] = await Promise.all([
                        hasEnrolledPromise,
                        remainingTimePromise,
                        finalTokensPromise,
                        claimedPromise
                    ]);
        
                    // Filter events based on enrollment and time criteria
                    const eventTime = event.time * 1000;
                    const threeHoursAfterEvent = eventTime + (3 * 60 * 60 * 1000);
                    let status = currentTime < eventTime ? 'Active' : 'Past';

                    const hasAttended = await NOTTContract.hasTakenAttendance(event.eventId, address);
                    if (status === 'Past' && currentTime >= threeHoursAfterEvent && !hasAttended) {
                        return undefined;
                    }

                    if (hasEnrolled && status === 'Past') {
                        return {
                            eventId: event.eventId,
                            name: event.name,
                            time: event.time,
                            venue: event.venue,
                            ipfsHash: event.ipfsHash,
                            description: event.description,
                            finalTokens: finalTokens.toNumber(),
                            remainingTime: remainingTime.toNumber(),
                            totalVotes: await votingContract.getTotalVotesForEvent(event.eventId),
                            claimed: claimed,
                            hasAttended: hasAttended
                        };
                    }
                }));
        
                // Filter out undefined events and set state
                const enrolledAndPassedEventsDetails = eventsWithDetails.filter(event => event !== undefined);
                setEnrolledAndPassedEvents(enrolledAndPassedEventsDetails);
            } catch (error) {
                console.error('Error fetching enrolled and passed events:', error);
            }
        }
        
        fetchData();

        // Fetch signer's Ethereum address
        async function fetchSignerAddress() {
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const address = await signer.getAddress();
                setSignerAddress(address);
            } catch (error) {
                console.error('Error fetching signer address:', error);
            }
        }

        fetchSignerAddress();
    }, []);
    
    // Handle horizontal scrolling within event lists
    useEffect(() => {
        function handleWheelScroll(event) {
            const delta = Math.max(-1, Math.min(1, event.deltaY));
            event.currentTarget.scrollLeft -= delta * 100;
            event.preventDefault();
        }

        if (claimableEventsRef.current) {
            claimableEventsRef.current.addEventListener('wheel', handleWheelScroll);
        }
        if (claimedEventsRef.current) {
            claimedEventsRef.current.addEventListener('wheel', handleWheelScroll);
        }

        return () => {
            if (claimableEventsRef.current) {
                claimableEventsRef.current.removeEventListener('wheel', handleWheelScroll);
            }
            if (claimedEventsRef.current) {
                claimedEventsRef.current.removeEventListener('wheel', handleWheelScroll);
            }
        };
    }, []);

    // Filter claimed and claimable events
    const claimedEvents = enrolledAndPassedEvents.filter(event => event.claimed);
    const pendingClaimEvents = enrolledAndPassedEvents.filter(event => !event.claimed);    

    // Render the TokenClaimmableEventList component UI
    return (
        <div>
            {/* Render Navbar component with signer address */}
            <Navbar signerAddress={signerAddress} />
            <h3 className="text-4xl font-bold text-center text-[#0b287b] mt-4 mb-8">Claim Tokens</h3>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Render collapsible section for claimable events */}
                <div className="collapsible-container mt-4">
                    <Collapsible
                        trigger={
                            <div className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4 flex justify-between items-center" onClick={() => setIsClaimableEventsOpen(!isClaimableEventsOpen)}>
                                <span className='w-full'>Claimable Events</span>
                                <div className={`transform transition-transform ${isClaimableEventsOpen ? 'rotate-90' : 'rotate-0'}`}>
                                    <FaArrowAltCircleRight size={24} />
                                </div>
                            </div>
                        }
                        open={isClaimableEventsOpen}
                        transitionTime={200}
                    >
                       <div className="flex flex-nowrap overflow-x-auto py-4" ref={claimableEventsRef}>
                            {/* Render message if no claimable events */}
                            {pendingClaimEvents.length === 0 ? (
                                <div className="flex justify-center items-center h-full w-full">
                                <div className="text-center">
                                    <img src={oops} alt="Oops Image" className="mb-2 h-52 mx-auto" />
                                    <p className="text-gray-600">Apologies, there are currently no events available for claiming. Feel free to join our upcoming events!</p>
                                </div>
                            </div>
                            
                            
                            ) : (
                                // Render claimable events
                                pendingClaimEvents.map((event, index) => (
                                    <div key={index} className="flex-none w-full sm:w-1/2 lg:w-1/3 px-4">
                                        <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
                                            <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-64 object-cover" />
                                            <div className="p-4">
                                                <p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
                                                <p className="mt-1 text-gray-600">Name: {event.name}</p>
                                                <p className="mt-1 text-gray-600">Time: {new Date(event.time * 1000).toLocaleString()}</p>
                                                <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                                                <p className="mt-1 text-gray-600">Description: {event.description}</p>
                                                <p className="mt-1 text-gray-600">Tokens Rewarded: {event.finalTokens === 0 ? 'N/A' : event.finalTokens}</p>
                                                <Link to={`/attendance/${event.eventId}`} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4 text-center block">Claim Tokens</Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                    </Collapsible>
                </div>

                {/* Render collapsible section for claimed events */}
                <div className="collapsible-container mt-4">
                    <Collapsible
                        trigger={
                            <div className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mb-4 flex justify-between items-center" onClick={() => setIsClaimedEventsOpen(!isClaimedEventsOpen)}>
                                <span className='w-full'>Claimed Events</span>
                                <div className={`transform transition-transform ${isClaimedEventsOpen ? 'rotate-90' : 'rotate-0'}`}>
                                    <FaArrowAltCircleRight size={24} />
                                </div>
                            </div>
                        }
                        open={isClaimedEventsOpen}
                        transitionTime={200}
                    >
                        <div className="flex flex-nowrap overflow-x-auto py-4" ref={claimedEventsRef}>
                            {/* Render message if no claimed events */}
                            {claimedEvents.length === 0 ? (
                                <div className="flex justify-center items-center h-full w-full">
                                <div className="text-center">
                                    <img src={oops} alt="Oops Image" className="mb-2 h-52 mx-auto" />
                                    <p className="text-gray-600">Apologies, there are currently no events available for claiming. Feel free to join our upcoming events!</p>
                                </div>
                            </div>
                            
                            
                            ) : (
                                // Render claimed events
                                claimedEvents.map((event, index) => (
                                    <div key={index} className="flex-none w-full sm:w-1/2 lg:w-1/3 px-4">
                                        <div className="bg-white rounded-lg shadow-lg overflow-hidden h-full">
                                            <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-64 object-cover" />
                                            <div className="p-4">
                                                <p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
                                                <p className="mt-1 text-gray-600">Name: {event.name}</p>
                                                <p className="mt-1 text-gray-600">Time: {new Date(event.time * 1000).toLocaleString()}</p>
                                                <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
                                                <p className="mt-1 text-gray-600">Description: {event.description}</p>
                                                <p className="mt-1 text-gray-600">Tokens Rewarded: {event.finalTokens === 0 ? 'N/A' : event.finalTokens}</p>
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

export default TokenClaimmableEventList;
