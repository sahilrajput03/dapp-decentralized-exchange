// @ts-nocheck
const {assert} = require('console')
const web3 = require('web3')
const {toDecimal, toBN, fromWei, fromUtf8, fromAscii, toWei, BN} = web3.utils
const utf8ToHex = web3.utils.fromAscii
const hexToUtf8 = web3.utils.hexToUtf8

assert(toWei('1') === '1000000000000000000', 'wei to ether')
assert(fromWei('1000000000000000000') === '1', 'ether to wei')

// Convert eth value upto 2 decimals
const twoDecimalsETH = (m) => {
	let tuple = m.split('.')
	if (tuple.length === 1) return tuple // do try to get two decimals if there is no decimal

	tuple[1] = tuple[1].slice(0, 2)
	return tuple[0] + '.' + tuple[1]
}

assert(twoDecimalsETH(fromWei('1230000000000000000')) === '1.23')

assert(new BN('200000000000000000').gt(new BN(2)), 'Greater than comparison Big Number with web3js')

// '200000000000000000'
