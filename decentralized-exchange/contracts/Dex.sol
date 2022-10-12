// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

// import "hardhat/console.sol";
import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol';

// Our Token Registry
contract Dex {
	struct Token {
		bytes32 tiker;
		address tokenAddress;
	}

	enum Side {
		BUY,
		SELL
	}

	struct Order {
		uint id;
		Side side;
		bytes32 ticker;
		uint amount;
		uint filled; 
	}
	// `filled` is useful say for e.g., when there is some market order of 50 but our amount is 100, so the filled will set to 50 and we'll be left with 50 more to be filled.

	// ticker -> Side (0, 1) -> Order[] ; Also the order array is sorted by best price i.e., best prices are going to be in the beginning of the array. For e.g, Buy Order sorted via best prices [80, 70, 60, 45], Sell order sorted via best prices: [30, 35, 40, 60]
	// Also if have two orders at same price then we'll have older order is ranked first.
	mapping (bytes32 => mapping(uint => Order[])) orderBook;

	mapping(bytes32 => Token) public tokens;
	bytes32[] public tokenList;
	// traderAddress => ticker => balance
	mapping(address => mapping(bytes32 => uint)) public traderBalances; 
	address public admin;
	// keep track the current order id
	uint public nextOrderId;
	bytes32 constant DAI = bytes32('DAI'); // This will also save us some gas becoz this will not be computed when you run the smart contract but when you compile it

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

	// fn to create a limit order
	function createLimitOrder(bytes32 ticker, uint amount, uint price, Side side) tokenExists() external {
		// we need to make sure that the token is not Dai becoz dai is used as quote currency and we should not be able to buy or sell dai itself
		require(ticker != DAI, 'cannot trade DAI');
		// for sell orders we need to make sure that trader have enough tokens in the balance
		if(side == side.SELL){
			require( traderBalances[msg.sender][ticker] >= amount, 'token balance is too low');
		} else {
		// if this is buy order we need to make sure trader has enough DAI token
			require(traderBalances[msg.sender][DAI] >=  amount*price, 'dai balance too low');
		}

		// now we can add the order to order book
		// first we get pointe to all the orders
		Orders[] storage orders = orderBook[ticker][uint(side)];
		// push the order at the end of order array
		orders.push(nextOrderId, side, ticker, amount, 0, price, now())
		
		// bubble sort
		uint i = orders.length - 1; // LETS say we have 3 orders already then after pushing new order, its idx is 4 so it can jump for 3 times at maz say if its maximum of all orders.
		while(i > 0){
			// for buy orders high prices at beginning and for sell low prices at beginning		
			if(side == Side.BUY && orders[i-1].price > orders[i].price){ // buy order
				break; // becoz previousElem > currentElem is a happy path
			}
			if(side == Side.SELL && orders[i-1].price < orders[i].price){ // sell order
				break; // becoz previousElem > currentElem is a happy path
			}

			// swap elements (so we only swap if none of the above conditions match)
			Order memory order = orders[i-1];
			orders[i-1] = orders[i];
			orders[i] = order;

			// DECREMENT I FOR THE WHILE LOOP
			i--;
		}
		nextOrderId++;
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
