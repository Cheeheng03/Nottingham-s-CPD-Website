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
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [tokensWorth, setTokensWorth] = useState(5);
    const [hasVoted, setHasVoted] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const [votesForToken5, setVotesForToken5] = useState(0);
    const [votesForToken10, setVotesForToken10] = useState(0);
    const [votesForToken15, setVotesForToken15] = useState(0);
	const [totalVotesForToken5, setTotalVotesForToken5] = useState(0);
	const [totalVotesForToken10, setTotalVotesForToken10] = useState(0);
	const [totalVotesForToken15, setTotalVotesForToken15] = useState(0);
	const [signerAddress, setSignerAddress] = useState('');
	const [loading, setLoading] = useState(false); 
	const provider = new ethers.providers.Web3Provider(window.ethereum);

    useEffect(() => {
		const initializePage = async () => {
			await fetchEvent();
			await fetchRemainingTime();
			await fetchVotesForTokens();
	
			const userHasVoted = await getVotesForTokenFromBlockchain(eventId, tokensWorth) > 0;
			setHasVoted(userHasVoted);

		};
		fetchSignerAddress();
		initializePage();
	
		const intervalId = setInterval(() => {
			updateRemainingTime();
		}, 1000);
	
		return () => clearInterval(intervalId);

		async function fetchSignerAddress() {
			try {
			  const signer = provider.getSigner();
			  const address = await signer.getAddress();
			  setSignerAddress(address);
			  console.log("signer:", address);
			} catch (error) {
			  console.error('Error fetching signer address:', error);
			}
		}
	}, [eventId, tokensWorth]);
    const fetchEvent = async () => {
      try {
        const event = await getEventFromBlockchain(eventId);
        setEvent(event);
      } catch (error) {
        console.error('Error fetching event:', error);
      }
    };
  
    const fetchRemainingTime = async () => {
        try {
            const remainingTimeFromBlockchain = await getRemainingTimeFromBlockchain(eventId);
            console.log("Remaining Time from Blockchain:", remainingTimeFromBlockchain);
            setRemainingTime(remainingTimeFromBlockchain);
        } catch (error) {
            console.error('Error fetching remaining time:', error);
        }
    };

    const updateRemainingTime = () => {
        setRemainingTime((prevRemainingTime) => (prevRemainingTime > 0 ? prevRemainingTime - 1 : 0));
    };
    
  
    const fetchVotesForTokens = async () => {
		try {
			const votes5 = await getVotesForTokenFromBlockchain(eventId, 5);
			const votes10 = await getVotesForTokenFromBlockchain(eventId, 10);
			const votes15 = await getVotesForTokenFromBlockchain(eventId, 15);
	
			setVotesForToken5(votes5);
			setVotesForToken10(votes10);
			setVotesForToken15(votes15);
	
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

		  } else {
			console.log('You have already voted for this event.');
			setLoading(false);
		  }
		} catch (error) {
		  console.error('Error handling vote:', error);
		  setLoading(false);
		}
	  };
  
    if (!event) {
      return <div>Loading...</div>;
    }

    return (
    <div className="relative">
		<Navbar signerAddress={signerAddress} />
		{loading && (
			<div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
				<img src={loadinggif} alt="Loading..." className="h-28" />
				<p className="text-white ml-3">Please wait for the transaction to be successful...</p>
			</div>
		)}

		<div className="flex items-center">
			<Link to="/eventlist" className="text-blue-500 ml-4 mt-2 text-sm font-medium flex items-center">
			<FiArrowLeft className="h-5 w-5 mr-1" />
			Back to Event List
			</Link>
		</div>
	
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

const formatRemainingTime = (remainingTime) => {
	if (remainingTime <= 0) {
	  return '00:00:00';
	}
  
	const seconds = remainingTime % 60;
	const minutes = Math.floor((remainingTime / 60) % 60);
	const hours = Math.floor(remainingTime / 3600);
  
	return `${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
  };	

const padZero = (num) => {
    return num < 10 ? `0${num}` : `${num}`;
};

  
export default VotePage;
