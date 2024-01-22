import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { FiArrowLeft } from 'react-icons/fi';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const eventRegistryContractAddress = '0x881E5586C6e1F6DF14647869Bc0aa99a30d95542';
const eventRegistryContractABI = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "creationTime",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "time",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "venue",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			}
		],
		"name": "EventCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			}
		],
		"name": "EventPublished",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "time",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "venue",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			}
		],
		"name": "createEvent",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "eventCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "events",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "creationTime",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "time",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "venue",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getActiveEvents",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "eventId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "creationTime",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "time",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "venue",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "ipfsHash",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "creator",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					}
				],
				"internalType": "struct EventRegistry.Event[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_eventId",
				"type": "uint256"
			}
		],
		"name": "getCreationTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_eventId",
				"type": "uint256"
			}
		],
		"name": "getEvent",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "eventId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "creationTime",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "time",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "venue",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "ipfsHash",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "creator",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					}
				],
				"internalType": "struct EventRegistry.Event",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_eventId",
				"type": "uint256"
			}
		],
		"name": "getEventCreator",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_eventId",
				"type": "uint256"
			}
		],
		"name": "getEventDetails",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "time",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "venue",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "getEventsCreatedByUser",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "eventId",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "creationTime",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "time",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "venue",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "ipfsHash",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "creator",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					}
				],
				"internalType": "struct EventRegistry.Event[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTotalEvents",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "isEventPublished",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_eventId",
				"type": "uint256"
			}
		],
		"name": "removePublishedEvent",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];
const votingContractAddress = '0xF0C0fe57E8Fa38CEeC9D951DA2C7D08b450C1570';
const votingContractABI = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_eventRegistryAddress",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "eventId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "finalTokens",
				"type": "uint256"
			}
		],
		"name": "FinalTokenAmountDecided",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "eventCreationTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "eventRegistry",
		"outputs": [
			{
				"internalType": "contract EventRegistry",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "eventVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "finalTokenAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_eventId",
				"type": "uint256"
			}
		],
		"name": "getEventDetailsWithFinalTokenAmount",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "time",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "venue",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "ipfsHash",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "finalTokens",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_eventId",
				"type": "uint256"
			}
		],
		"name": "getRemainingTime",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "remainingTime",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_eventId",
				"type": "uint256"
			}
		],
		"name": "getTotalVotesForEvent",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_eventId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_voter",
				"type": "address"
			}
		],
		"name": "getVotesForToken",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "votes",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "hasVoted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "tokenTotalVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "tokenVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_eventId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_tokens",
				"type": "uint256"
			}
		],
		"name": "vote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];

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
	const [eventsToPublish, setEventsToPublish] = useState([]);


  
    useEffect(() => {
		const initializePage = async () => {
			await fetchEvent();
			await fetchRemainingTime();
			await fetchVotesForTokens();
	
			// Check if the user has already voted on page load
			const userHasVoted = await getVotesForTokenFromBlockchain(eventId, tokensWorth) > 0;
			setHasVoted(userHasVoted);
		};
	
		initializePage();
	
		// Set up interval to update remaining time every second
		const intervalId = setInterval(() => {
			updateRemainingTime();
		}, 1000);
	
		// Clear the interval when the component is unmounted
		return () => clearInterval(intervalId);
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
        // Pass the eventId and the signer's address (voter's Ethereum address)
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
			// Pass the eventId and the tokens value to get total votes for the specific token
			const totalVotes = await votingContract.tokenTotalVotes(eventId, tokens);
			return totalVotes;
		} catch (error) {
			console.error(`Error fetching total votes for ${tokens} tokens from blockchain:`, error);
			return 0;
		}
	};

	const checkEventForPublicationFromBlockchain = async (eventId) => {
		const signer = provider.getSigner();
		const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
	  
		try {
		  // Call the contract function to check if the event is eligible for publishing
		  const isEligibleForPublishing = await votingContract.checkEventForPublication(eventId);
		  return isEligibleForPublishing;
		} catch (error) {
		  console.error('Error checking event for publication from blockchain:', error);
		  return false;
		}
	  };
	  
	  // Add a new function to get the list of events to publish
	  const getEventsToPublishFromBlockchain = async () => {
		const signer = provider.getSigner();
		const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
	  
		try {
		  // Call the contract function to get the list of events to publish
		  const eventsToPublish = await votingContract.getEventsToPublish();
		  return eventsToPublish;
		} catch (error) {
		  console.error('Error getting events to publish from blockchain:', error);
		  return [];
		}
	  };
	  
	  // Add the handleVote function
	  const handleVote = async () => {
		try {
		  const signer = provider.getSigner();
		  const votingContract = new ethers.Contract(votingContractAddress, votingContractABI, signer);
	  
		  // Check if the user has already voted
		  const userHasVoted = await getVotesForTokenFromBlockchain(eventId, tokensWorth) > 0;
	  
		  if (!userHasVoted) {
			// Call the contract function to record the vote
			await votingContract.vote(eventId, tokensWorth);
	  
			// Set hasVoted to true to prevent multiple votes
			setHasVoted(true);
	  
			// Fetch updated votes after voting
			fetchVotesForTokens();
	  
			const totalVotes = await getTotalVotesForTokenFromBlockchain(eventId, tokensWorth);
			if (tokensWorth === 5) {
			  setTotalVotesForToken5(totalVotes);
			} else if (tokensWorth === 10) {
			  setTotalVotesForToken10(totalVotes);
			} else if (tokensWorth === 15) {
			  setTotalVotesForToken15(totalVotes);
			}
	  
			// Log or perform other actions based on the user's address or information
			console.log(`User at address ${await signer.getAddress()} has cast a vote for Event ID ${eventId}`);
	  
			// Check if the voted event is eligible for publishing
			const isEligibleForPublishing = await checkEventForPublicationFromBlockchain(eventId);
	  
			// If eligible, add the event to the list to be published
			if (isEligibleForPublishing) {
			  console.log(`Event ID ${eventId} is eligible for publishing. Adding to the list...`);
			  const updatedEventsToPublish = await getEventsToPublishFromBlockchain();
			  setEventsToPublish(updatedEventsToPublish);
			} else {
			  console.log(`Event ID ${eventId} is not eligible for publishing.`);
			}
		  } else {
			console.log('You have already voted for this event.');
		  }
		} catch (error) {
		  console.error('Error handling vote:', error);
		}
	  };
  
    if (!event) {
      return <div>Loading...</div>;
    }

    return (
    <div className="relative">
      <Navbar />
      <div className="flex items-center">
        <Link to="/eventlist" className="text-blue-500 ml-4 mt-2 text-sm font-medium flex items-center">
          <FiArrowLeft className="h-5 w-5 mr-1" />
          Back to Event List
        </Link>
      </div>
  
      <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">Vote for {event.name}</h3>
      <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
        <img src={`${event.ipfsHash}`} alt={event.name} className="w-full h-96 object-cover mb-4 rounded-lg" />
        <p className="text-lg font-semibold text-gray-800">Event ID: {event.eventId.toString()}</p>
        <p className="mt-1 text-gray-600">Name: {event.name}</p>
        <p className="mt-1 text-gray-600">Time: {new Date(event.time.mul(1000).toNumber()).toLocaleString()}</p>
        <p className="mt-1 text-gray-600">Venue: {event.venue}</p>
        <p className="mt-1 text-gray-600">Description: {event.description}</p>
        <p className="mt-1 text-gray-600">Remaining Time to Vote: {formatRemainingTime(remainingTime)}</p>

		{/* <p className="mt-1 text-gray-600">Total Votes for 5 tokens: {totalVotesForToken5.toString()}</p>
		<p className="mt-1 text-gray-600">Total Votes for 10 tokens: {totalVotesForToken10.toString()}</p>
		<p className="mt-1 text-gray-600">Total Votes for 15 tokens: {totalVotesForToken15.toString()}</p> */}

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
