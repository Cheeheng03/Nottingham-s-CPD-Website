/*
 * Source code written by SEGP Group P
 * Vote component for voting on events for Nottingham s-CPD website
 * External libraries used: react, ethers
 */

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FiArrowLeft } from 'react-icons/fi';
import loadinggif from '../Images/loading.gif';
import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract'
import { votingContractAddress, votingContractABI } from '../Address&Abi/VotingContract'


const VotePage = () => {
    // Retrieve event ID from URL parameters
    const { eventId } = useParams();
    // State to store event details
    const [event, setEvent] = useState(null);
    // State to store the number of tokens worth
    const [tokensWorth, setTokensWorth] = useState(5);
    // State to track whether the user has voted
    const [hasVoted, setHasVoted] = useState(false);
    // State to track remaining time for voting
    const [remainingTime, setRemainingTime] = useState(0);
    // State to store total votes for each token value
	const [totalVotesForToken5, setTotalVotesForToken5] = useState(0);
	const [totalVotesForToken10, setTotalVotesForToken10] = useState(0);
	const [totalVotesForToken15, setTotalVotesForToken15] = useState(0);
    // State to store signer's Ethereum address
	const [signerAddress, setSignerAddress] = useState('');
    // State to track loading state
	const [loading, setLoading] = useState(false); 
    // Ethereum provider setup
	const provider = new ethers.providers.Web3Provider(window.ethereum);

    // useEffect hook to fetch event details, remaining time, and votes for tokens
    useEffect(() => {
        // Function to initialize page
		const initializePage = async () => {
			await fetchEvent();
			await fetchRemainingTime();
			await fetchVotesForTokens();
	
			// Check if the user has voted
			const userHasVoted = await getVotesForTokenFromBlockchain(eventId, tokensWorth) > 0;
			setHasVoted(userHasVoted);
		};
		// Fetch signer's Ethereum address
		fetchSignerAddress();
		// Initialize page
		initializePage();
	
		// Update remaining time every second
		const intervalId = setInterval(() => {
			updateRemainingTime();
		}, 1000);
	
		return () => clearInterval(intervalId);

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
	}, [eventId, tokensWorth]);

    // Function to fetch event details from the blockchain
    const fetchEvent = async () => {
        try {
            const event = await getEventFromBlockchain(eventId);
            setEvent(event);
        } catch (error) {
            console.error('Error fetching event:', error);
        }
    };
  
    // Function to fetch remaining time for voting from the blockchain
    const fetchRemainingTime = async () => {
        try {
            const remainingTimeFromBlockchain = await getRemainingTimeFromBlockchain(eventId);
            setRemainingTime(remainingTimeFromBlockchain);
        } catch (error) {
            console.error('Error fetching remaining time:', error);
        }
    };

    // Function to update remaining time every second
    const updateRemainingTime = () => {
        setRemainingTime((prevRemainingTime) => (prevRemainingTime > 0 ? prevRemainingTime - 1 : 0));
    };
    
  
    // Function to fetch total votes for each token value from the blockchain
    const fetchVotesForTokens = async () => {
		try {
			const totalVotes5 = await getTotalVotesForTokenFromBlockchain(eventId, 5);
			const totalVotes10 = await getTotalVotesForTokenFromBlockchain(eventId, 10);
			const totalVotes15 = await getTotalVotesForTokenFromBlockchain(eventId, 15);
	
			setTotalVotesForToken5(totalVotes5);
			setTotalVotesForToken10(totalVotes10);
			setTotalVotesForToken15(totalVotes15);
		} catch (error) {
			console.error('Error fetching votes for tokens:', error);
		}
	};

    // Function to fetch event details from the blockchain
    const getEventFromBlockchain = async (eventId) => {
      const signer = provider.getSigner();
      const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);
  
      try {
        const event = await eventRegistryContract.getEvent(eventId);
        return event;
      } catch (error) {
        console.error('Error fetching event from blockchain:', error);
        return null;
      }
    };
  
    // Function to fetch remaining time for voting from the blockchain
    const getRemainingTimeFromBlockchain = async (eventId) => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
  
      try {
        const remainingTime = await votingContract.getRemainingTime(eventId);
        return remainingTime;
      } catch (error) {
        console.error('Error fetching remaining time from blockchain:', error);
        return 0;
      }
    };
  
    // Function to fetch votes for a specific token value from the blockchain
    const getVotesForTokenFromBlockchain = async (eventId, tokens) => {
      const signer = provider.getSigner();
      const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
  
      try {
        const votes = await votingContract.getVotesForToken(eventId, await signer.getAddress());
        return votes;
      } catch (error) {
        console.error(`Error fetching votes for ${tokens} tokens from blockchain:`, error);
        return 0;
      }
    };

	// Function to fetch total votes for a specific token value from the blockchain
	const getTotalVotesForTokenFromBlockchain = async (eventId, tokens) => {
		const signer = provider.getSigner();
		const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
	
		try {
			const totalVotes = await votingContract.tokenTotalVotes(eventId, tokens);
			return totalVotes;
		} catch (error) {
			console.error(`Error fetching total votes for ${tokens} tokens from blockchain:`, error);
			return 0;
		}
	};
	  
	// Function to handle voting process
	const handleVote = async () => {
		try {
		  const signer = provider.getSigner();
		  const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
	  
		  const userHasVoted = await getVotesForTokenFromBlockchain(eventId, tokensWorth) > 0;
	  
		  if (!userHasVoted) {
			setLoading(true);
			const transaction = await votingContract.vote(eventId, tokensWorth);
            await transaction.wait();
			setLoading(false);
			setHasVoted(true);
			fetchVotesForTokens();
	  
			const totalVotes = await getTotalVotesForTokenFromBlockchain(eventId, tokensWorth);
			if (tokensWorth === 5) {
			  setTotalVotesForToken5(totalVotes);
			} else if (tokensWorth === 10) {
			  setTotalVotesForToken10(totalVotes);
			} else if (tokensWorth === 15) {
			  setTotalVotesForToken15(totalVotes);
			}
	  
			console.log(`User at address ${await signer.getAddress()} has cast a vote for Event ID ${eventId}`);
			alert("Casted voted for event successully");
		  } else {
			console.log('You have already voted for this event.');
			setLoading(false);
		  }
		} catch (error) {
		  console.error('Error handling vote:', error);
		  setLoading(false);
		}
	  };
  
    // Render loading indicator if event details are not yet fetched
    if (!event) {
      return <div>Loading...</div>;
    }

    // Render the VotePage component UI
    return (
    <div className="relative">
		{/* Render Navbar component with signer address */}
		<Navbar signerAddress={signerAddress} />

    	{/* Render loading overlay when transaction is in progress */}
		{loading && (
			<div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
				<img src={loadinggif} alt="Loading..." className="h-28" />
				<p className="text-white ml-3">Please wait for the transaction to be successful...</p>
			</div>
		)}

    	{/* Render Back button */}
		<div className="flex items-center">
			<Link to="/eventvotinglist" className="text-blue-500 ml-4 mt-2 text-sm font-medium flex items-center">
				<FiArrowLeft className="h-5 w-5 mr-1" />
				Back to Event Voting List
			</Link>
		</div>
	
		{/* Render event details */}
		<h3 className="text-2xl font-bold text-center text-[#0b287b] mb-8 mt-4">Vote for {event.name}</h3>
		<div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
			<img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-60 lg:h-96 object-cover mb-4 rounded-lg" />
			<p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
			<p className="mt-1 text-gray-600">Name: {event.name}</p>
			<p className="mt-1 text-gray-600">Time: {new Date(event.time.mul(1000).toNumber()).toLocaleString()}</p>
			<p className="mt-1 text-gray-600">Venue: {event.venue}</p>
			<p className="mt-1 text-gray-600">Description: {event.description}</p>
			<p className="mt-1 text-gray-600">Remaining Time to Vote: {formatRemainingTime(remainingTime)}</p>

			<div>
				<label className="block mt-4 text-sm font-medium text-gray-700">
					Number of Votes for 5 tokens:
				</label>
				<input
					type="range"
					min="0"
					max="7"
					value={Number(totalVotesForToken5)}
					readOnly
					className="mt-1 w-full"
				/>
				<p className="text-gray-600 text-center">{totalVotesForToken5.toString()}</p>
			</div>

			<div>
				<label className="block mt-4 text-sm font-medium text-gray-700">
					Number of Votes for 10 tokens:
				</label>
				<input
					type="range"
					min="0"
					max="7"
					value={Number(totalVotesForToken10)}
					readOnly
					className="mt-1 w-full"
				/>
				<p className="text-gray-600 text-center">{totalVotesForToken10.toString()}</p>
			</div>

			<div>
				<label className="block mt-4 text-sm font-medium text-gray-700">
					Number of Votes for 15 tokens:
				</label>
				<input
					type="range"
					min="0"
					max="7"
					value={Number(totalVotesForToken15)}
					readOnly
					className="mt-1 w-full"
				/>
				<p className="text-gray-600 text-center">{totalVotesForToken15.toString()}</p>
			</div>

			<label className="block mt-4 text-sm font-medium text-gray-700">Number of Tokens to Vote:</label>
			<select
			value={tokensWorth}
			onChange={(e) => setTokensWorth(e.target.value)}
			className="mt-1 p-2 w-full border border-gray-300 rounded-md"
			>
				<option value="5">5 tokens</option>
				<option value="10">10 tokens</option>
				<option value="15">15 tokens</option>
			</select>
	
			{/* Render vote button */}
			<button
				onClick={handleVote}
				className={`mt-4 p-2 rounded-md cursor-pointer ${
				hasVoted ? 'bg-gray-400 text-gray-700' : 'bg-blue-500 text-white hover:bg-blue-600'
				}`}
				disabled={hasVoted}
			>
				{hasVoted ? 'Voted' : 'Vote'}
			</button>
		</div>
    </div>
  );
};

// Function to format remaining time in HH:MM:SS format
const formatRemainingTime = (remainingTime) => {
	if (remainingTime <= 0) {
	  return '00:00:00';
	}
  
	const seconds = remainingTime % 60;
	const minutes = Math.floor((remainingTime / 60) % 60);
	const hours = Math.floor(remainingTime / 3600);
  
	return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
};	

// Function to pad zero for single-digit numbers
const padZero = (num) => {
    return num < 10 ? `0${num}` : `${num}`;
};

  
export default VotePage;
