// import { create } from 'ipfs-http-client';

// // Retrieve these from your Infura Project settings
// // const projectId = '2YAc5MnK5EFBF4YdoYrEUl9tn9J'; // Replace with your actual Infura Project ID
// // const projectSecret = '1292f24408ff81f34b407b44bd4611af'; // Replace with your actual Infura Project Secret

// const projectId = 'b1361df614521104e4ab'; // Replace with your actual Infura Project ID
// const projectSecret = '4183cb1e5276ba655b5174520a224bdc6b2f40b0a9e19a6fc4bfbc39ccddebf6'; // Replace with your actual Infura Project Secret

// // Authorization header using project ID and project secret
// const auth = 'Basic ' + btoa(`${projectId}:${projectSecret}`);

// // Configure the IPFS client instance with authorization headers
// export const ipfs = create({
//     host: 'ipfs.infura.io',
//     port: 5001,
//     protocol: 'https',
//     headers: {
//         authorization: auth,
//     },
// });

// // Function to upload a file to IPFS
// export const uploadToIPFS = async (file) => {
//     try {
//         // Convert the base64-encoded image to a Uint8Array
//         const uint8Array = new Uint8Array(
//             atob(file.replace(/^data:image\/\w+;base64,/, ''))
//             .split('')
//             .map((char) => char.charCodeAt(0))
//         );

//         // Upload the Uint8Array to IPFS
//         const added = await ipfs.add(uint8Array);
//         const ipfsHash = `https://gateway.pinata.cloud/ipfs/${added.path}`;
//         console.log('Uploaded to IPFS:', ipfsHash);
//         return ipfsHash;
//     } catch (error) {
//         console.error('Error uploading file to IPFS:', error.message);
//         throw error;
//     }
// };

import axios from 'axios';

// Replace with your actual Pinata API key and secret
const pinataApiKey = 'b1361df614521104e4ab';
const pinataSecretApiKey = '4183cb1e5276ba655b5174520a224bdc6b2f40b0a9e19a6fc4bfbc39ccddebf6';

// Function to upload a file to IPFS using Pinata
export const uploadToIPFS = async (file) => {
    try {
        // Convert the base64-encoded image to a Uint8Array
        const uint8Array = new Uint8Array(
            atob(file.replace(/^data:image\/\w+;base64,/, ''))
            .split('')
            .map((char) => char.charCodeAt(0))
        );

        // Prepare the Pinata API endpoint for pinning
        const pinataApiUrl = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

        // Prepare the headers with Pinata API keys
        const headers = {
            'Content-Type': 'multipart/form-data',
            'pinata_api_key': pinataApiKey,
            'pinata_secret_api_key': pinataSecretApiKey,
        };

        // Prepare the form data
        const formData = new FormData();
        formData.append('file', new Blob([uint8Array]));

        // Make the request to Pinata API
        const response = await axios.post(pinataApiUrl, formData, {
            headers: headers,
        });

        // Check if the request was successful
        if (response.status === 200) {
            const ipfsHash = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
            console.log('Uploaded to IPFS via Pinata:', ipfsHash);
            return ipfsHash;
        } else {
            console.error('Failed to upload file to IPFS via Pinata. Status Code:', response.status);
            console.error('Error Message:', response.data.error.message);
            throw new Error('Failed to upload file to IPFS via Pinata');
        }
    } catch (error) {
        console.error('Error uploading file to IPFS via Pinata:', error.message);
        throw error;
    }
};


