// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

// import "hardhat/console.sol";

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/utils/math/SafeMath.sol';

// Our Token Registry
contract Dex {
	struct Token {
		bytes32 ticker;
		address tokenAddress;
	}

	// in solidity we can use `using` keyword allows us to use a library and attach it to a particular type.
	using SafeMath for uint;
	// LEARN: Now we have methods of `SafeMath.sol` like for eg we can do `a.add(2)` and it will evaluate to `add(a,2)` where add is a fn from `SafeMath.sol`.

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
		uint price;
		uint date;
	}
	// `filled` is useful say for e.g., when there is some market order of 50 but our amount is 100, so the filled will set to 50 and we'll be left with 50 more to be filled.

	// ticker -> Side (0, 1) -> Order[] ; Also the order array is sorted by best price i.e., best prices are going to be in the beginning of the array. For e.g, Buy Order sorted via best prices [80, 70, 60, 45], Sell order sorted via best prices: [30, 35, 40, 60]
	// Also if have two orders at same price then we'll have older order is ranked first.
	mapping(bytes32 => mapping(uint => Order[])) orderBook;

	mapping(bytes32 => Token) public tokens;
	bytes32[] public tokenList;
	// traderAddress => ticker => balance
	mapping(address => mapping(bytes32 => uint)) public traderBalances;
	address public admin;
	// keep track the current order id
	uint public nextOrderId;
	uint public nextTradeId;
	bytes32 constant DAI = bytes32('DAI'); // This will also save us some gas becoz this will not be computed when you run the smart contract but when you compile it

	// LEARN: To ameka contract non-deployable you can do it by making it "abstract"
	constructor() {
		admin = msg.sender;
	}

	function getOrders(bytes32 ticker, Side side) external view returns (Order[] memory) {
		return orderBook[ticker][uint(side)];
	}

	event NewTrade(
		uint tradeId,
		uint orderId,
		bytes32 indexed ticker,
		address indexed trader1,
		address indexed trader2,
		uint amount, // AMOUNT IS THE NUMBER OF TOKENS REQUESTED FOR THE TRADE ~Sahil
		uint price,
		uint date
	);

	function addToken(bytes32 ticker, address tokenAddress) external onlyAdmin {
		tokens[ticker] = Token(ticker, tokenAddress);
		tokenList.push(ticker);
	}

	// fn to send tokens - consider `mohit` calls this fn(2, 'SIB') thus he means to shift from SIB account to this wallet say DEX.
	function deposit(uint amount, bytes32 ticker) external tokenExists(ticker) {
		IERC20(tokens[ticker].tokenAddress).transferFrom(msg.sender, address(this), amount);
		// safemath// traderBalances[msg.sender][ticker] += amount;
		traderBalances[msg.sender][ticker] = traderBalances[msg.sender][ticker].add(amount);
	}

	function withdraw(uint amount, bytes32 ticker) external tokenExists(ticker) {
		require(traderBalances[msg.sender][ticker] >= amount, 'balance too low');
		// safemath // traderBalances[msg.sender][ticker] -= amount;
		traderBalances[msg.sender][ticker] = traderBalances[msg.sender][ticker].sub(amount);
		IERC20(tokens[ticker].tokenAddress).transfer(msg.sender, amount);
	}

	// fn to create a limit order
	function createLimitOrder(
		bytes32 ticker,
		uint amount,
		uint price,
		Side side
	) external tokenExists(ticker) tokenIsNotDai(ticker) {
		// for sell orders we need to make sure that trader have enough tokens in the balance
		if (side == Side.SELL) {
			require(traderBalances[msg.sender][ticker] >= amount, 'token balance is too low');
		} else {
			// if this is buy order we need to make sure trader has enough DAI token
			// safemath // require(traderBalances[msg.sender][DAI] >=  amount*price, 'dai balance too low');
			require(traderBalances[msg.sender][DAI] >= amount.mul(price), 'dai balance too low');
		}

		// now we can add the order to order book
		// first we get pointe to all the orders
		Order[] storage orders = orderBook[ticker][uint(side)];
		// push the order at the end of order array
		orders.push(Order(nextOrderId, msg.sender, side, ticker, amount, 0, price, block.timestamp));

		// using bubble sort algorithm
		// integer underflow error fix: // uint i = orders.length - 1; // LETS say we have 3 orders already then after pushing new order, its idx is 4 so it can jump for 3 times at maz say if its maximum of all orders.
		uint i = orders.length > 0 ? orders.length - 1 : 0; // LETS say we have 3 orders already then after pushing new order, its idx is 4 so it can jump for 3 times at maz say if its maximum of all orders.
		while (i > 0) {
			// for buy orders high prices at beginning and for sell low prices at beginning
			if (side == Side.BUY && orders[i - 1].price > orders[i].price) {
				// buy order
				break; // becoz previousElem > currentElem is a happy path
			}
			if (side == Side.SELL && orders[i - 1].price < orders[i].price) {
				// sell order
				break; // becoz previousElem > currentElem is a happy path
			}

			// swap elements (so we only swap if none of the above conditions match)
			Order memory order = orders[i - 1];
			orders[i - 1] = orders[i];
			orders[i] = order;

			// DECREMENT I FOR THE WHILE LOOP
			// safemath // i--;
			i = i.sub(1);
		}
		// safe math // nextOrderId++;
		nextOrderId = nextOrderId.add(1);
	}

	// LEARN: Exchagne: Market orders are matched with best priced limit buy/sell orders and market order will keep settling up with the limit orders in the order of best price until the market order is filled.
	// vid 85
	function createMarketOrder(
		bytes32 ticker,
		uint amount,
		Side side
	) external tokenExists(ticker) tokenIsNotDai(ticker) {
		if (side == Side.SELL) {
			require(traderBalances[msg.sender][ticker] >= amount, 'token balance too low');
		}

		Order[] storage orders = orderBook[ticker][uint(side == Side.BUY ? Side.SELL : Side.BUY)];
		uint i; // default value is 0
		uint remaining = amount; // AMOUNT IS THE NUMBER OF REQUESTED TOKENS BY THE CALLER

		while (i < orders.length && remaining > 0) {
			// we need to know the available liquidity of each order of the orderbook
			// safemath // uint available = orders[i].amount - orders[i].filled; // AVAILABLE TOKENS FOR BUY/SELL OF EACH LIMIT ORDER ~IMO~Sahil
			uint available = orders[i].amount.sub(orders[i].filled); // AVAILABLE TOKENS FOR BUY/SELL OF EACH LIMIT ORDER ~IMO~Sahil
			uint matched = (remaining > available) ? available : remaining; // MATCH IS THE MAXIMUM POSSIBLE BUY/SELL TOKENS FROM THIS PARTICULAR LIMIT ORDER
			// safemath // remaining -= matched;
			remaining = remaining.sub(matched);
			// safemath // orders[i].filled += matched;
			orders[i].filled = orders[i].filled.add(matched);
			emit NewTrade(
				nextTradeId, // uint tradeId,
				orders[i].id, // uint orderId,
				ticker, // bytes32 indexed ticker,
				orders[i].trader, // address indexed trader1,
				msg.sender, // address indexed trader2,
				matched, // uint amount, // AMOUNT IS THE NUMBER OF TOKENS REQUESTED FOR THE TRADE ~Sahil
				orders[i].price, // price from limitOrder // uint price,
				block.timestamp // uint date,
			);
			if (side == Side.SELL) {
				// DEDUCT TICKER AND ADD DAI
				traderBalances[msg.sender][ticker] = traderBalances[msg.sender][ticker].sub(matched);
				traderBalances[msg.sender][DAI] = traderBalances[msg.sender][DAI].add(matched.mul(orders[i].price));
				// safemath // traderBalances[msg.sender][ticker] -= matched;
				// safemath // traderBalances[msg.sender][DAI] += matched * orders[i].price;

				// ADD TICKER AND DEDUCT DAI
				traderBalances[orders[i].trader][ticker] = traderBalances[orders[i].trader][ticker].add(matched);
				traderBalances[orders[i].trader][DAI] = traderBalances[orders[i].trader][DAI].sub(matched.mul(orders[i].price));
				// safemath // traderBalances[orders[i].trader][ticker] += matched;
				// safemath // traderBalances[orders[i].trader][DAI] -= matched * orders[i].price;
			}

			// copy of same above code but conditioned for buy order this time
			if (side == Side.BUY) {
				require(traderBalances[msg.sender][DAI] >= matched.mul(orders[i].price), 'dai balance too low');
				// DEDUCT TICKER AND ADD DAI
				traderBalances[msg.sender][ticker] = traderBalances[msg.sender][ticker] + matched;
				traderBalances[msg.sender][DAI] = traderBalances[msg.sender][DAI].sub(matched.mul(orders[i].price));
				// safemath // traderBalances[msg.sender][ticker] += matched;
				// safemath // traderBalances[msg.sender][DAI] -= matched * orders[i].price;
				
				// ADD TICKER AND DEDUCT DAI
				traderBalances[orders[i].trader][ticker] = traderBalances[orders[i].trader][ticker].sub(matched);
				traderBalances[orders[i].trader][DAI] = traderBalances[orders[i].trader][DAI].add(matched.mul(orders[i].price));
				// safemath // traderBalances[orders[i].trader][ticker] -= matched;
				// safemath // traderBalances[orders[i].trader][DAI] += matched * orders[i].price;
			}
			// we know its less readable than before (i.e., without safemath) but we got no choice becoz its more important to be more safe than readable.
			// safemath // nextOrderId++;
			nextOrderId = nextOrderId.add(1);
			// safemath // i++;
			i = i.add(1);
		}

		// algorithm to remove the empty trades from the orderBook, VIEW VID 85 (END PART OF IT)
		i = 0;
		while (i < orders.length && orders[i].filled == orders[i].amount) {
			// inner for loop
			for (uint j = i; j < orders.length - 1; j++) {
				orders[j] = orders[j + 1];
			}
			orders.pop();
			// safemath // i++;
			i = i.add(1);
		}
	}

	// we need to make sure that the token is not Dai becoz dai is used as quote currency and we should not be able to buy or sell dai itself
	modifier tokenIsNotDai(bytes32 ticker) {
		require(ticker != DAI, 'cannot trade DAI');
		_;
	}

	modifier tokenExists(bytes32 ticker) {
		require(tokens[ticker].tokenAddress != address(0), 'this token does not exist');
		_;
	}

	modifier onlyAdmin() {
		require(msg.sender == admin, 'only admin');
		_;
	}
}

// Creating a wallet in our smart contract
// Before a trader are able to our decentralized exchange they need to first send ethereum token to our smart contract. So we're gonna create two fns, a fn to receive ethereum tokens and another fn to withdraw these tokens. And we also need to keep track how many tokens are send by which address, so for that we're gonna need a mapping i.e., `traderBalances` which is address => bytes32 => uint (balanceOfEachTrader).
