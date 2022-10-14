// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

// import "hardhat/console.sol";
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract Bat is ERC20 {
	constructor() ERC20('Brave browser token', 'BAT') {}

	function faucet(address _account, uint _amount) external {
		_mint(_account, _amount);
	}
}
