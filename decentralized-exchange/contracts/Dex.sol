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
		address trader;
		Side side;
		bytes32 ticker;
		uint amount; // AMOUNT IS THE NUMBER OF TOKENS OF THE ORDER ~Sahil
		uint filled; 
		// price??
		// date??
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
	uint public nextTradeId;
	bytes32 constant DAI = bytes32('DAI'); // This will also save us some gas becoz this will not be computed when you run the smart contract but when you compile it
	

	constructor() public {
		admin = msg.sender;
	}

	event NewTrade(
		uint tradeId,
		uint orderId,
		bytes32 indexed ticker,
		address indexed trader1,
		address indexed trader2,
		uint amount, // AMOUNT IS THE NUMBER OF TOKENS REQUESTED FOR THE TRADE ~Sahil
		uint price,
		uint date,
	)

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
	function createLimitOrder(bytes32 ticker, uint amount, uint price, Side side) tokenExists() tokenIsNotDai(ticker) external {
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
		orders.push(Order(nextOrderId, msg.sender, side, ticker, amount, 0, price, now()))
		
		// using bubble sort algorithm
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

	// LEARN: Exchagne: Market orders are matched with best priced limit buy/sell orders and market order will keep settling up with the limit orders in the order of best price until the market order is filled.
	// vid 85
	function createMarketOrder(bytes32 ticker, uint amount, Side side) tokenExists(token) tokenIsNotDai(ticker) external (
		if(side == Side.SELL){
			require(traderBalances[msg.sender][ticker] >= amount, 'token balance too low');
		}

		Orders[] storage orders = orderBook[ticker][uint(side == Side.BUY ? Side.SELL: Side.BUY)];
		uint i; // default value is 0
		uint remaining = amount; // AMOUNT IS THE NUMBER OF REQUESTED TOKENS BY THE CALLER

		while(i < orders.length && remaining > 0){
			// we need to know the available liquidity of each order of the orderbook
			uint available = orders[i].amount - orders[i].filled; // AVAILABLE TOKENS FOR BUY/SELL OF EACH LIMIT ORDER ~IMO~Sahil
			uint matched = (remaining > available) ? available : remaining; // MATCH IS THE MAXIMUM POSSIBLE BUY/SELL TOKENS FROM THIS PARTICULAR LIMIT ORDER
			remaining -= matched;
			orders[i].filled += matched;
			emit NewTrade(
				nextTradeId, // uint tradeId,
				orders[i].id, // uint orderId,
				ticker, // bytes32 indexed ticker,
				orders[i].trader, // address indexed trader1,
				msg.sender. , // address indexed trader2,
				matched, // uint amount, // AMOUNT IS THE NUMBER OF TOKENS REQUESTED FOR THE TRADE ~Sahil
				orders[i].price, // price from limitOrder // uint price,
				now // uint date,
			);
			if(side == Side.SELL){
				// deduct ticker and add dai
				traderBalances[msg.sender][ticker] -= matched;
				traderBalances[msg.sender][DAI] += matched * orders[i].price;
				// add ticker and deduct dai
				traderBalances[orders[i].trader][ticker] += matched;
				traderBalances[orders[i].trader][DAI] -= matched * orders[i].price;
			}

			// copy of same above code but conditioned for buy order this time
			if(side == Side.BUY){
				require(traderBalances[msg.sender][DAI] >= matched * orders[i].price, 'dai balance too low');
				// deduct ticker and add dai
				traderBalances[msg.sender][ticker] += matched;
				traderBalances[msg.sender][DAI] -= matched * orders[i].price;
				// add ticker and deduct dai
				traderBalances[orders[i].trader][ticker] -= matched;
				traderBalances[orders[i].trader][DAI] += matched * orders[i].price;
			}
			nextOrderId++;
			i++;
		}

		// algorithm to remove the empty trades from the orderBook, VIEW VID 85 (END PART OF IT)
		i = 0;
		while(i < orders.length && orders[i].filled == orders[i].amount){
			// inner for loop
			for (uint j = i; j < orders.length - 1; j++){
				orders[j] = orders[j+1];
			}
			orders.pop();
			i++;
		}
	)

	// we need to make sure that the token is not Dai becoz dai is used as quote currency and we should not be able to buy or sell dai itself
	modifier tokenIsNotDai(bytes32 ticker){
		require(ticker != DAI, 'cannot trade DAI');
		_;
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
