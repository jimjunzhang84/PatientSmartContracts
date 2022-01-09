# Patient Smart Contracts
This project is on top of the Hyperledger Fabric blockchain framework. Hyperledger is an 
open source community focused on developing a suite of stable frameworks, tools and libraries for 
enterprise-grade blockchain deployments. Hyperledger was established under the Linux Foundation. It 
serves as a neutral home for various distributed ledger frameworks including Hyperledger Fabric. 
Hyperledger Fabric is an open source enterprise-grade permissioned distributed ledger technology (DLT) 
platform, designed for use in enterprise contexts, that delivers some key differentiating capabilities over 
other popular distributed ledger or blockchain platforms. 

# Smart Contract
Smart contracts are mediums that are used to manage digital assets, store information, make decisions, and 
interact with other smart contracts. Hyperledger Fabric smart contracts usually manipulate JSON-like 
digital assets (arrays of key-value pairs) of any complexity. For every digital asset we want to store on a 
Hyperledger Fabric blockchain, there must be a smart contract in place for its management (writing data on 
the blockchain, updating, reading, etc.).
In Hyperledger Fabric smart contracts are packaged into chaincodes and the chaincode is deployed on the 
Hyperledger Fabric blockchain. Chaincode is a term local to the Hyperledger Fabric framework and, for 
now, you can think of chaincode and smart contract as synonyms. 

# Project Description
In a project, we are writing a smart contract that manages patient record digital assets. 
As part of that project, we are in charge of complementing several smart contract functions:
1. Core Patient record assets on the Hyperledger Fabric blockchain network.
2. A set of APIs to create and query Patient record assets from the Hyperledger Fabric blockchain network.
3. Specially, recording key information (e.g. name) of Patient with AB- blood type in DASH public blockchain.
   The key information is stored in OP-RETURN transaction by using UTXO, and it can be queryed.

# Reference
1. https://hyperledger-fabric.readthedocs.io/en/latest/developapps/smartcontract.html
2. https://github.com/hyperledger/fabric-samples/tree/master/commercial-paper/organization/magnetocorp/contract
3. https://www.chainrider.io/docs/dash/
