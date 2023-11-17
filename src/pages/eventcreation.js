import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { uploadToIPFS } from '../ipfs';
import emailjs from "@emailjs/browser";
import Navbar from '../components/Navbar';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const contractAddress = '0xA711f695D969AE2edE87A8c834B97615B705c75a';
const contractABI = [
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
				"name": "time",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "venue",
				"type": "string"
			}
		],
		"name": "EventCreated",
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
				"internalType": "struct EventRegistry.Event",
				"name": "",
				"type": "tuple"
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
	}
]

export default function CreateEventForm() {
    const [name, setName] = useState('');
    const [venue, setVenue] = useState('');
    const [time, setTime] = useState('');
    const [image, setImage] = useState('');
    const [description, setDescription] = useState('');

    const signer = provider.getSigner();
    const myContract = new ethers.Contract(contractAddress, contractABI, signer);

    useEffect(() => {
        emailjs.init("IubfEuLnET42uLPrA");
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const eventTime = Math.floor(new Date(time).getTime() / 1000);

        try {
            // Upload the image to IPFS and get the hash
            const ipfsHash = await uploadToIPFS(image);

            // Create the event using the IPFS hash
            const transaction = await myContract.createEvent(name, eventTime, venue, ipfsHash, description);
            await transaction.wait();
            alert('Event created successfully');

            const emailParams = {
				description: description
            };

            emailjs.send('service_yk80258', 'template_65s4gmp', emailParams)
                .then((response) => {
                    console.log('Email sent successfully!', response.status, response.text);
                })
                .catch((error) => {
                    console.log('Email failed to send', error);
                });

        } catch (error) {
            console.error('Error creating event:', error);
            alert('Error creating event: ' + error.message);
        }
    };

    const handleImageChange = (event) => {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result.toString());
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div>
			<Navbar />
			<form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-md shadow-md">
				<div className="mb-4">
					<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventName">
						Event Name:
					</label>
					<input
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
						type="text"
						id="eventName"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Event Name"
					/>
				</div>

				<div className="mb-4">
					<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventTime">
						Event Time:
					</label>
					<input
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
						type="datetime-local"
						id="eventTime"
						value={time}
						onChange={(e) => setTime(e.target.value)}
						placeholder="Event Time"
					/>
				</div>

				<div className="mb-4">
					<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventVenue">
						Event Venue:
					</label>
					<input
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
						type="text"
						id="eventVenue"
						value={venue}
						onChange={(e) => setVenue(e.target.value)}
						placeholder="Event Venue"
					/>
				</div>

				<div className="mb-4">
					<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventDescription">
						Event Description:
					</label>
					<textarea
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Event Description"
						rows="6"
					></textarea>
				</div>

				<div className="mb-4">
					<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventImage">
						Event Image:
					</label>
					<div className="flex items-center justify-between border rounded-md px-4 py-2 bg-gray-100">
						<span className="text-gray-500">Choose a file</span>
						<input
						className="hidden"
						type="file"
						onChange={handleImageChange}
						id="eventImage"
						/>
						<label
						className="cursor-pointer text-blue-500 hover:underline"
						htmlFor="eventImage"
						>
						Browse
						</label>
					</div>
				</div>

				<div className="mb-4">
				<button
					className="w-full bg-[#002D74] text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
					type="submit"
				>
					Create Event
				</button>
				</div>
  			</form>
        </div>
    );
}
