// @ts-ignore
const {artifacts, contract, beforeEach, web3, assert, it} = global

/* Writing Tests in JavaScript: https://trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript/ */

// artifacts is an object injected in a test file by truffle - vid 47
const Wallet = artifacts.require('Wallet')

contract('Wallet', (accounts) => {
	let wallet;
	beforeEach(async () => {
		// this callback will be executed before each of our tests
		wallet = await Wallet.new([accounts[0], accounts[1], accounts[2]], 2);// we're passing array of addreses and quorum (second argument) as 2 i.e., minium number of approvers for the transaction
		// truffle also injects web3 object into the test file as well
		await web3.eth.sendTransaction({from: accounts[0], to: wallet.address, value: 1000}); // sending 1000 wei to smart contract with web3
	})

	it('should have correct approvers and quorum', async () => {
		const approvers = await wallet.getApprovers()
		const quorum = await wallet.quorum()
		// console.log('approvers?', approvers)
		// console.log('quorum?', quorum)
		assert(approvers.length === 3)
		assert(approvers[0] === accounts[0])
		assert(approvers[1] === accounts[1])
		assert(approvers[2] === accounts[2])
		assert(Number(quorum) === 2) // you can compare string of numbers when numbers are out of range of javascript (i.e., hack for comparing big numbers i.e., quorum === '200000_A_BIG_NUMBER_HERE' ~ Course Author)
		// continue from vid-49@1:06 
	})
})
