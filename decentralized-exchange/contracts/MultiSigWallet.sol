// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

// import "hardhat/console.sol";

// Our Token Registry
contract Dex {
	struct Token {
		bytes32 tiker;
		address tokenAddress;
	}

	mapping(bytes32 => Token) public tokens;
	bytes32[] public tokenList;
	mapping(address => mapping(bytes32 => uint)) public traderBalances;
	address public admin;

	constructor() public {
		admin = msg.sender;
	}

	function addToken(bytes32 tiker, address tokenAddress) onlyAdmin() external {
		tokens[ticker] = Token(ticker, tokenAddress);
		tokenList.push(ticker);
	}

	// fn to send tokens
	function deposit(){
		
	}

	modifier onlyAdmin(){
		require(msg.sender == admin, 'only admin');
		_;
	}
}

// creating a wallet in our smart contract
// Before a trader are able to our decentralized exchange they need to first send ethereum token to our smart contract. So we're gonna create two fns, a fn to receive ethereum tokens and another fn to withdraw these tokens. And we also need to keep track how many tokens are send by which address, so for that we're gonna need a mapping i.e., `traderBalances` which is address => bytes32 => uint (balanceOfEachTrader).
