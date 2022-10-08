// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import './ContractB.sol';

contract A{
	//1. call function of other contract
	//2. import keyword
	//3. contract interface
	//4. error propagation

	//1. interface of B => B
	//2. address of B
	
	address addressB; // STATE VARIABLE

	function setAddressB(address _addressB) external {
		addressB = _addressB;	
	}

	function callHelloWorld() external view returns (string memory) {
		// B b = B(addressB); // instance of contract B
		InterfaceB b = InterfaceB(addressB); // instance of contract B
		return b.helloWorld(); // `helloWorld()` throw error say via `rever()` then the value retuned will suffer IDK exactly though. ~Sahil
	}
}

// MOVED TO FILE `ContractB.sol`
// contract B{
// 	function helloWorld() external pure returns(string memory){
// 		return 'hello world';
// 	}
// }
