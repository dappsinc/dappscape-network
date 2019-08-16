//let salesforceEndpoint = require('../endpoints/salesforce');

let config = {};

//Node Server setting
config.PORT = 3000;

//Fabric settings
config.CORE_PEER_MSPCONFIPATH = '';
config.CORE_PEER_ADDRESS = 'http://13.82.180.73:8545';
config.CORE_PEER_LOCALMSPID = '';
config.CORE_PEER_TLS_ROOTCERT_FILE= '';



module.exports = config;