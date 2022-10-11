// @ts-ignore
const {artifacts, contract, beforeEach, web3, assert, it} = global

/** WRITING TESTS IN JAVASCRIPT: https://trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript/
 * RUNNING TESTS
 * truffle test
 * OR YOU CAN USE:
 * truffle test ./path/to/test/file.js
 */

// artifacts is an object injected in a test file by truffle - vid 47
const Wallet = artifacts.require('MultiSigWallet')

contract('MultiSigWallet', (accounts) => {
	let wallet
	beforeEach(async () => {
		// this callback will be executed before each of our tests
		wallet = await Wallet.new([accounts[0], accounts[1], accounts[2]], 2) // we're passing array of addreses and quorum (second argument) as 2 i.e., minium number of approvers for the transaction
		// truffle also injects web3 object into the test file as well
		await web3.eth.sendTransaction({from: accounts[0], to: wallet.address, value: 1000}) // sending 1000 wei to smart contract with web3
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
	})

	it('should create transfers', async () => {
		// we can create a transfer of less than or equal to 1000 wei coz we created the contract with 1000 wei amount.
		// In return value we get transfer receipt from below tx though ~Author
		// createTransfer ARGUMENTS: amount and receipient address
		const TRANSFER_AMOUNT = 100
		await wallet.createTransfer(TRANSFER_AMOUNT, accounts[5], {
			from: accounts[0], // you can use it to execute this test from a particular account
		})

		const transfers = await wallet.getTransfers()
		// console.log({transfers})
		// +++ OUTPUT +++
		// id: '0',
		// amount: '1000',
		// to: '0x2932b7A2355D6fecc4b5c0B6BD44cC31df247a2e',
		// approvals: '0',
		// sent: false

		assert(transfers.length === 1)
		assert(transfers[0].id === '0')
		assert(transfers[0].amount === TRANSFER_AMOUNT.toString())
		assert(transfers[0].to === accounts[5])
		assert(transfers[0].approvals === '0')
		assert(transfers[0].sent === false)
	})
})
