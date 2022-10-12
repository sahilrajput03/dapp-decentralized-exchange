// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

// import "hardhat/console.sol";
import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol';
import 'https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20Detailed.sol';

contract Bat is ERC20, ERC20Detailed {
	// note: for most ERC20 tokens the number of `decimals` is 18 to make it consistent with ETHER
	constructor() ERC20Detailed('BAT', 'Brave browser token', 18) public {}
}
