// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

// import "hardhat/console.sol";
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

// Augur Token: https://coinmarketcap.com/currencies/augur/
// Mocking Augur Token
contract Rep is ERC20 {
	constructor() ERC20('Augur token', 'REP') {}

	function faucet(address _account, uint _amount) external {
		_mint(_account, _amount);
	}
}
