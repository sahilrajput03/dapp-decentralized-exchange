// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

// import "hardhat/console.sol";
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

// **DEPRECATED**: IERC20Detailed Missig? https://forum.openzeppelin.com/t/erc20detailed-sol-file-is-missing/3259

// Mocking Dai Token (MODIFIED IT TO DaiT coz I already have a Dai contract in learn-contract/ directory)
contract DaiT is ERC20 {
	constructor() ERC20('Dai Stable Coin', 'DAI') {}

	function faucet(address _account, uint _amount) external {
		_mint(_account, _amount);
	}
}
