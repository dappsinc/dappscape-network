const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const IdCard = require('composer-common').IdCard;
const FileSystemCardStore = require('composer-common').FileSystemCardStore;
const BusinessNetworkCardStore = require('composer-common').BusinessNetworkCardStore;
const AdminConnection = require('composer-admin').AdminConnection;


// var fileSystemCardStore = new FileSystemCardStore();
var businessNetworkCardStore = new BusinessNetworkCardStore();
var adminConnection = new AdminConnection();


class SalesforceNetwork {

  constructor(cardName) {
    this.currentParticipantId;
    this.cardName = cardName;
    this.connection = new BusinessNetworkConnection();
  }

// The GLUE

// Create Account  {dapps.salesforce.crm.addNewAccount}

createAccount(transactionData) {
  var _this = this;
  var resource;
  var transactionData;
  transactionData['$class'] = "dapps.salesforce.crm.addNewAccount";
  return this.connection.getTransactionRegistry("dapps.salesforce.crm.addNewAccount")
  .then(function(createProductTransactionRegistry) {
    serializer = _this.businessNetworkDefinition.getSerializer()
    resource = serializer.fromJSON(transactionData);
    return _this.connection.submitTransaction(resource);
  
  })
}


// Create Lead  {dapps.salesforce.crm.addNewLead}

createLead(transactionData) {
  var _this = this;
  var resource;
  var transactionData;
  transactionData['$class'] = "dapps.salesforce.crm.addNewLead";
  return this.connection.getTransactionRegistry("dapps.salesforce.crm.addNewLead")
  .then(function(createProductTransactionRegistry) {
    serializer = _this.businessNetworkDefinition.getSerializer()
    resource = serializer.fromJSON(transactionData);
    return _this.connection.submitTransaction(resource);
  
  })
}


// Create Contact  {dapps.salesforce.crm.addNewContact}

createContact(transactionData) {
  var _this = this;
  var resource;
  var transactionData;
  transactionData['$class'] = "dapps.salesforce.crm.addNewContact";
  return this.connection.getTransactionRegistry("dapps.salesforce.crm.addNewContact")
  .then(function(createProductTransactionRegistry) {
    serializer = _this.businessNetworkDefinition.getSerializer()
    resource = serializer.fromJSON(transactionData);
    return _this.connection.submitTransaction(resource);
  
  })
}



// Create User {dapps.salesforce.crm.addNewUser}


createUser(transactionData) {
  var _this = this;
  var resource;
  var transactionData;
  transactionData['$class'] = "dapps.salesforce.crm.addNewUser";
  return this.connection.getTransactionRegistry("dapps.salesforce.crm.addNewUser")
  .then(function(createProductTransactionRegistry) {
    serializer = _this.businessNetworkDefinition.getSerializer()
    resource = serializer.fromJSON(transactionData);
    return _this.connection.submitTransaction(resource);
  
  })
}

};



/*

// Issue Identity {dapps.salesforce.crm.issueIdentity}

createIdentity(transactionData) {
  var _this = this;
  var resouce;
  var transactionData;
  transactionData['$class'] = "dapps.salesforce.crm.issueIdentity";
  return this.connection.getTransactionRegistry("dapps.salesforce.crm.issueIdentity")
  .then(function(createIdentityTransactionRegistry) {
    serializer = _this.businessNetworkDefinition.getSerializer()
    resource = serializer.fromJSON(transactionData);
    return _this.connection.submitTransaction(resource);
  
  })
}

};


// Bind Identity {dapps.salesforce.crm.bindIdentity}

bindIdentity(transactionData) {
  var _this = this;
  var resouce;
  var transactionData;
  transactionData['$class'] = "dapps.salesforce.crm.bindIdentity";
  return this.connection.getTransactionRegistry("dapps.salesforce.crm.bindIdentity")
  .then(function(createIdentityTransactionRegistry) {
    serializer = _this.businessNetworkDefinition.getSerializer()
    resource = serializer.fromJSON(transactionData);
    return _this.connection.submitTransaction(resource);
  
  })
}



};

*/