// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

// import "hardhat/console.sol";
import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol';
import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20Detailed.sol';

// Our Token Registry
contract Dex {
	struct Token {
		bytes32 tiker;
		address tokenAddress;
	}

	mapping(bytes32 => Token) public tokens;
	bytes32[] public tokenList;
	mapping(address => mapping(bytes32 => uint)) public traderBalances; // traderAddress => ticker => balance
	address public admin;

	constructor() public {
		admin = msg.sender;
	}

	function addToken(bytes32 tiker, address tokenAddress) onlyAdmin() external {
		tokens[ticker] = Token(ticker, tokenAddress);
		tokenList.push(ticker);
	}

	// fn to send tokens - consider `mohit` calls this fn(2, 'SIB') thus he means to shift from SIB account to this wallet say DEX.
	function deposit(uint amount, bytes32 ticker) tokenExists(ticker) external {
		IERC20(tokens[ticker].tokenAddress).transferFrom(msg.sender, address(this), amount);
		traderBalances[msg.sender][ticker] += amount;
	}

	function withdraw(uint amount, bytes32 ticker) tokenExists(ticker) external {
		require(traderBalances[msg.sender][ticker] >= amount, 'balance too low');
		traderBalances[msg.sender][ticker] -= amount;
		IERC20(tokens[ticker].tokenAddress).transfer(msg.sender, amount);
	}

	modifier tokenExists(bytes32 ticker){
		require(tokens[ticker].tokenAddress != address(0), 'this token does not exist');
		_;
	}

	modifier onlyAdmin(){
		require(msg.sender == admin, 'only admin');
		_;
	}
}

// Creating a wallet in our smart contract
// Before a trader are able to our decentralized exchange they need to first send ethereum token to our smart contract. So we're gonna create two fns, a fn to receive ethereum tokens and another fn to withdraw these tokens. And we also need to keep track how many tokens are send by which address, so for that we're gonna need a mapping i.e., `traderBalances` which is address => bytes32 => uint (balanceOfEachTrader).
