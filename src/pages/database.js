import React, { useState } from 'react';
import { ethers } from 'ethers';
import Navbar from '../components/Navbar';

// Define your smart contract address and ABI
const StudentInfoAddress = '0x107e106717C449dfD86090587668E5963FfF3906';
const StudentInfoAbi = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_studentID",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_email",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_password",
				"type": "string"
			}
		],
		"name": "registerStudent",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "walletAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "studentID",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "email",
				"type": "string"
			}
		],
		"name": "StudentRegistered",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "getAllStudents",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "studentID",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "email",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "password",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "walletAddress",
						"type": "address"
					}
				],
				"internalType": "struct StudentInfo.Student[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getStudentInfo",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
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
				"internalType": "string",
				"name": "_studentID",
				"type": "string"
			}
		],
		"name": "getStudentInfoByStudentID",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"name": "studentIDExists",
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "students",
		"outputs": [
			{
				"internalType": "string",
				"name": "studentID",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "email",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "password",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "walletAddress",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]

function Database() {
    const [searchStudentId, setSearchStudentId] = useState('');
    const [studentInfo, setStudentInfo] = useState({});
    
    async function searchStudent() {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const studentInfoContract = new ethers.Contract(StudentInfoAddress, StudentInfoAbi, provider);

        try {
            const result = await studentInfoContract.getStudentInfoByStudentID(searchStudentId);
            const [studentID, name, email, password, walletAddress] = result;

            if (studentID === "" || name === "" || email === "" || password === "" || walletAddress === "0x0000000000000000000000000000000000000000") {
                alert("Student not found.");
            } else {
                setStudentInfo({ studentID, name, email, password, walletAddress });
            }
        } catch (error) {
            console.error(error);
            alert("Failed to fetch student information. Please check your input.");
        }
    }

    return (
        <div>
            <Navbar />
            <h2>Search Student by ID</h2>
            <input
                type="text"
                placeholder="Student ID"
                onChange={(e) => setSearchStudentId(e.target.value)}
            />
            <button onClick={searchStudent}>Search Student</button>

            {/* Display the student information */}
            {studentInfo.studentID ? (
                <div>
                    <p>Student ID: {studentInfo.studentID}</p>
                    <p>Name: {studentInfo.name}</p>
                    <p>Email: {studentInfo.email}</p>
                    <p>Password: {studentInfo.password}</p>
                    <p>Wallet Address: {studentInfo.walletAddress}</p>
                </div>
            ) : null}
        </div>
    );
}

export default Database;
