import React, { useState } from 'react';
import { ethers } from 'ethers';
import Navbar from '../components/Navbar';
import { StudentInfoAddress, StudentInfoAbi } from '../Address&Abi/StudentRegistryContract';

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
