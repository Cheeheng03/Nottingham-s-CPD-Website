export const questionnaireContractAddress = '0x37fb6BDf8ef89cA64F449dFa85f75b53C7bD4408';
export const questionnaireContractABI = [
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
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_eventId",
				"type": "uint256"
			},
			{
				"internalType": "string[]",
				"name": "_questions",
				"type": "string[]"
			},
			{
				"internalType": "string[][]",
				"name": "_options",
				"type": "string[][]"
			},
			{
				"internalType": "string[]",
				"name": "_correctAnswers",
				"type": "string[]"
			}
		],
		"name": "addQuestionnaire",
		"outputs": [],
		"stateMutability": "nonpayable",
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
				"name": "_eventId",
				"type": "uint256"
			}
		],
		"name": "getQuestionnaire",
		"outputs": [
			{
				"internalType": "string[]",
				"name": "questions",
				"type": "string[]"
			},
			{
				"internalType": "string[][]",
				"name": "options",
				"type": "string[][]"
			},
			{
				"internalType": "string[]",
				"name": "correctAnswers",
				"type": "string[]"
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
		"name": "questionnaireExists",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];