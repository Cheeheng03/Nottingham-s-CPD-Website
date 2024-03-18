    import React, { useState, useEffect } from 'react';
    import { ethers } from 'ethers';
    import { Link } from 'react-router-dom';
    import Collapsible from 'react-collapsible';
    import Navbar from '../components/Navbar';
    import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract';
    import { votingContractAddress, votingContractABI } from '../Address&Abi/VotingContract';
    import { NOTTAddress, NOTTABI } from '../Address&Abi/NottinghamCoinContract';


    const ClaimToken = () => {
        const [enrolledAndPassedEvents, setEnrolledAndPassedEvents] = useState([]);
        const [signerAddress, setSignerAddress] = useState('');
        const [activeTab, setActiveTab] = useState('claimable');

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);
        const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
        const NOTTContract = new ethers.Contract(NOTTAddress, NOTTABI, signer);

        useEffect(() => {
            async function fetchData() {
                try {
                    const provider = new ethers.providers.Web3Provider(window.ethereum);
                    const signer = provider.getSigner();
                    const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);
                    const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
                    const NOTTContract = new ethers.Contract(NOTTAddress, NOTTABI, signer);
            
                    const events = await eventRegistryContract.getActiveEvents();
                    const currentTime = new Date().getTime();
            
                    const eventsWithDetails = await Promise.all(events.map(async (event) => {
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
            
                    const enrolledAndPassedEventsDetails = eventsWithDetails.filter(event => event !== undefined);
                    setEnrolledAndPassedEvents(enrolledAndPassedEventsDetails);
                } catch (error) {
                    console.error('Error fetching enrolled and passed events:', error);
                }
            }
            
            fetchData();
    
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
        
        const claimedEvents = enrolledAndPassedEvents.filter(event => event.claimed);
        const pendingClaimEvents = enrolledAndPassedEvents.filter(event => !event.claimed);
    
        // Helper function to render the event cards, as you had it but now it's inside the component.
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
                        {!event.claimed && (
                            <Link
                                to={`/attendance/${event.eventId}`}
                                className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 mt-4 text-center"
                            >
                                Claim Tokens
                            </Link>
                        )}
                    </div>
                </div>
            ));
        };
    
        return (
            <div>
                <Navbar signerAddress={signerAddress} />
                <div className="bg-gray-100 py-4 shadow">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h3 className="text-2xl font-bold text-center text-gray-800 mb-4">Attended Events List</h3>
                        <div className="flex justify-center space-x-4 border-b border-gray-300">
                            <div className="flex space-x-2">
                                <button onClick={() => setActiveTab('claimable')} className={`px-4 py-2 uppercase font-semibold ${activeTab === 'claimable' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-blue-500'}`}>Claimable Events</button>
                                <button onClick={() => setActiveTab('claimed')} className={`px-4 py-2 uppercase font-semibold ${activeTab === 'claimed' ? 'text-blue-600 border-b-2 border-blue-600' : 'hover:text-blue-500'}`}>Claimed Events</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                </div>
            </div>
        );
    };
    
    export default ClaimToken;
