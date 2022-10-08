// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract InterfaceB {
// LEARN: INSPITE OF ABOVE LINE WE COULD HAVE USED BELOW LINE bcoz we can use keyword `interface` as well but downside is "interacases do not allow to inherit from other interfaces but contracts do so for this reason many people prefer to use contract instead of interface keyword."
// interface InterfaceB {
	function helloWorld() external pure returns(string memory);
	// Good thing is we can remove foo fuction by simply removing the signature of foo() function from this contract.
	function foo() external;
}

contract B {
	function helloWorld() external pure returns(string memory){
		revert(); // temporarily to triger error for some error propagation demo in `ContractA.sol`
		return 'hello world';
	}

	function foo() external{
		// whatever
	}
}
