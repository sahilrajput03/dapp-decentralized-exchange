# Readme

What is blockchain?

It is a special kind of db, and its main fn is to store data. Like its name implies it is a series of block of data. These blocks are linked to each other with cryptography.

Each block has two parts:
1. metadata: Timestamp at which the block was created and reference to previous block and a cryptographic signature of all the transactions.
2. transaction: describes how data changes. For e.g., for bitcoin a tx describes how bitcoin is transferred from an account to another one.

A blockchain is different from any traditional db coz you can not change data that's already on blockchain i.e., DATA IS IMMUTABLE. It is decentralized and censorship resistant, so a single actor can not control the network.

Blockchian network: A blockchain doesnot run on a single computer but instead it runs on a network of computers that are connected to each other, each one is called node and they together form a blockchain network. Anybody can run a node and can be a part of blockchian network. Thats why we say blockchain runs on a public network.

There are already databases which can run on multiple nodes, these are called distributed dbs. However none of them run on public network, they all run on private network.

So if anybody can run a node in BNwk (Blockchain Network) how can these networks be secure? Ans. For security we have mining process. If you want to add data to blockchain, you need to add a new block to blockchain with all the transaction data that needs to be in blockchain as you desire. If you want to do this you need to be engaged in a process called mining. Any node no blockchain can be a miner. When you are miner, you compete with other miners on the network to solve a mathematical equation. The first miner who solves this mathematical eqn has the right to add the next block to the blockchain. This mining process is described as Proof-Of-Work (POW). It is almost impossible to hack POW algorithm.

Whats great about POW?
1. It is very difficult to hack.
2. It doesn't rely on any centralized body.

Cons of our special kind of Database (Blockchain)?
- It is much much slower than traditional db bcoz you have to synchronize data across whole network that usually is distributed globally.
- It is less scalable.
- It is much expensive coz you have to pay miners their service for adding data to blockchain.
- They are completely public so there is no privacy, any data you put on blockchain can be seen by anybody.

Top 100 crypto currencies: https://coinmarketcap.com/

Addresses are not managed by cryptocurrencies and anybody is free to create as many addresses as they want using some wallets.

New bitcoins are regularly created by the blockchain to reward the miner who successfully added the block. This creation of new bitcoins is not infinite and will stop at somepoint which will limit the inflation of the bitcoin.

We can use bitcoin scripting to perform more complex transactions by using bitcoin scripting. But it is not very powerful, very few people use that and generally speaking its not very easy to build blockchain apps on top of bitcoin.

Ethereum is blockchain of 2nd generation capable of not only processing simple financial transaction but also any arbitary computation. This allowed to build much more sophisticated applications on top of ethereum blockchain.

On top of this basic blockchain technology, there's another part Ethereum Virtual Machine. So, EVM's are capable of running small programs called Smart Contracts. These SC can run code and manipulate the cryptocurrency i.e., ether. Also, with smart contracts you can code a multisignature wallet where you need to approval of serveral people before spending any ether. The beauty of Smart Contract is that their code is executed on blockchain so you don't need any third party to execute them. Once the code of the smart contract is deployed on the blockchain nobody can is able to change the the code and stop the code to run and its just going on blockchian foreever. Some contracts were did get hacked becoz of the bug in the code of the smart contract but never becoz of the ethereum technogoloy.

Transaction in are identified by hash. A Cryptographic has is a fingerprint, it uniquely identifies a piece of data. It looks like a gibberish text. So if we change one digit of the data, the hash will be completely different. We can produce the cryptographic hashes via cryptographic functions, like sha2, sha3. Hashes are fixed size of characters for any size of data. Cryptographic hashing is one way function.

On ethereum the cryptographic fn used is Keccak256, it is very similar to sha3.

In ethereum the role of addresses is to send and receive ether.

How ethereum addresses are created?
1. Private key - a very long number which is generated randomly. It must be kept secret like a password.

CONTINUTE FROM lesson-6 @ 25sec