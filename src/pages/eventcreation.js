/*
 * Source code written by SEGP Group P
 * CreateEventForm component for creating events for Nottingham s-CPD website
 * External libraries used: react, ethers, emailjs
 */

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { uploadToIPFS } from '../ipfs';
import emailjs from "@emailjs/browser";
import Navbar from '../components/Navbar';
import imagebg from '../Images/event.gif'
import loadinggif from '../Images/loading.gif';
import { eventRegistryContractAddress, eventRegistryContractABI } from '../Address&Abi/EventRegistryContract'


export default function CreateEventForm() {
	// State variables for event details
	const [name, setName] = useState('');
	const [venue, setVenue] = useState('');
	const [time, setTime] = useState('');
	const [image, setImage] = useState('');
	const [description, setDescription] = useState('');
	const [fileName, setFileName] = useState('');
	// State variable for signer's Ethereum address
	const [signerAddress, setSignerAddress] = useState('');
	// State variable for loading state
	const [loading, setLoading] = useState(false);
	// Ethereum provider setup
	const provider = new ethers.providers.Web3Provider(window.ethereum);

	// Ethereum signer and contract setup
	const signer = provider.getSigner();
	const eventRegistryContract = new ethers.Contract(eventRegistryContractAddress, eventRegistryContractABI, signer);

	// Fetch signer's Ethereum address on component mount
	useEffect(() => {
		// Initialize EmailJS
		emailjs.init("IubfEuLnET42uLPrA");

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
	}, []);

	// Function to handle form submission
	const handleSubmit = async (event) => {
		event.preventDefault();
		// Convert event time to Unix timestamp
		const eventTime = Math.floor(new Date(time).getTime() / 1000);

		try {
			setLoading(true);
			// Upload image to IPFS
			const ipfsHash = await uploadToIPFS(image);

			// Create event on the blockchain
			const transaction = await eventRegistryContract.createEvent(name, eventTime, venue, ipfsHash, description);
			await transaction.wait();
			setLoading(false);
			alert('Event created successfully');

			// Send confirmation email using EmailJS
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
			setLoading(false);
		}
	};

	// Function to handle image selection
	const handleImageChange = (event) => {
		if (event.target.files.length > 0) {
			const file = event.target.files[0];
			const reader = new FileReader();
			reader.onloadend = () => {
				setImage(reader.result.toString());
				setFileName(file.name);
			};
			reader.readAsDataURL(file);
		}
	};

	// Render the CreateEventForm component UI
    return (
        <div>
            {/* Render Navbar component with signer address */}
			<Navbar signerAddress={signerAddress} />

            {/* Render loading overlay when transaction is in progress */}
			{loading && (
				<div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
					<img src={loadinggif} alt="Loading..." className="h-28" />
					<p className="text-white ml-3">Please wait for the transaction to be successful...</p>
				</div>
			)}

			<div className="bg-cover bg-center max-w-xl mx-auto h:xl-60 relative mt-0 lg:mt-4">
				<img src={imagebg} alt={imagebg} className="w-full h-52 lg:h-80 object-cover rounded-md"/>
			</div>

			{/* Render form to be filled */}
			<form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white rounded-md shadow-md m-6">
				<div className='p-6'>
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
						<label htmlFor="eventVenue" className="block text-gray-700 text-sm font-bold mb-2">
							Event Venue:
						</label>
						<select
							id="eventVenue"
							className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
							value={venue}
							onChange={(e) => setVenue(e.target.value)}
						>
							<option value="">Select a venue</option>
							<option value="F1A04">F1A04</option>
							<option value="F1A12">F1A12</option>	
							<option value="F1A13">F1A13</option>
							<option value="TCR1">TCR1</option>
							<option value="F3C04">F3C04</option>
							<option value="F4C02">F4C02</option>
							<option value="BB80">BB80</option>
							<option value="Great Hall">Great Hall</option>
						</select>
					</div>


					<div className="mb-4">
						<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventDescription">
							Short Description:
						</label>
						<textarea
							className="w-full px-3 py-2 border rounded-md focus:outline-none focus:border-blue-500"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Event Description"
							rows="4"
						></textarea>
					</div>

            		{/* Render image file upload */}
					<div className="mb-4">
						<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="eventImage">
							Event Image:
						</label>
						<div className="flex items-center justify-between border rounded-md px-4 py-2 bg-gray-100">
							<div>
								<span className="text-gray-500">{fileName || 'Choose a file'}</span>
								{image && <img className="max-w-full h-128 mt-2" src={image} alt="Selected Event Image" />}
							</div>
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


                	{/* Render event creation button */}
					<div className="mb-4">
						<button
							className="w-full bg-[#002D74] text-white font-bold py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
							type="submit"
						>
							Create Event
						</button>
					</div>
				</div>
  			</form>
        </div>
    );
}