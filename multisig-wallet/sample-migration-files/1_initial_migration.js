// @ts-ignore
const {artifacts} = global
var MyContract = artifacts.require('MyContract')

module.exports = function (deployer) {
	// deployment steps
	deployer.deploy(MyContract)
	.then(() => {
		return MyContract.deployed()
	})

}
