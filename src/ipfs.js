// import { create } from 'ipfs-http-client';

// // Retrieve these from your Infura Project settings
// const projectId = '2XeqgPAExfJDwGV4sLbCEcYl97J'; // Replace with your actual Infura Project ID
// const projectSecret = '4d14b856d42ad079f50d071f3ca1a739'; // Replace with your actual Infura Project Secret

// // Authorization header using project ID and project secret
// const auth =
//   'Basic ' + Buffer.from(`${projectId}:${projectSecret}`).toString('base64');

// // Configure the IPFS client instance with authorization headers
// export const ipfs = create({
//   host: 'ipfs.infura.io',
//   port: 5001,
//   protocol: 'https',
//   headers: {
//     authorization: auth,
//   },
// });

// // Function to upload a file to IPFS
// export const uploadToIPFS = async (file) => {
//   try {
//     const added = await ipfs.add(file);
//     return `https://ipfs.infura.io/ipfs/${added.path}`;
//   } catch (error) {
//     console.error('Error uploading file to IPFS:', error.message);
//     throw error;
//   }
// };
import { create } from 'ipfs-http-client';

// Retrieve these from your Infura Project settings
const projectId = '2YAc5MnK5EFBF4YdoYrEUl9tn9J'; // Replace with your actual Infura Project ID
const projectSecret = '1292f24408ff81f34b407b44bd4611af'; // Replace with your actual Infura Project Secret

// Authorization header using project ID and project secret
const auth = 'Basic ' + btoa(`${projectId}:${projectSecret}`);

// Configure the IPFS client instance with authorization headers
export const ipfs = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

// Function to upload a file to IPFS
export const uploadToIPFS = async (file) => {
    try {
        // Convert the base64-encoded image to a Uint8Array
        const uint8Array = new Uint8Array(
            atob(file.replace(/^data:image\/\w+;base64,/, ''))
            .split('')
            .map((char) => char.charCodeAt(0))
        );

        // Upload the Uint8Array to IPFS
        const added = await ipfs.add(uint8Array);
        const ipfsHash = `https://gateway.pinata.cloud/ipfs/${added.path}`;
        console.log('Uploaded to IPFS:', ipfsHash);
        return ipfsHash;
    } catch (error) {
        console.error('Error uploading file to IPFS:', error.message);
        throw error;
    }
};



