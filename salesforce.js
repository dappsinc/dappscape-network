var nforce 			= require('nforce');
var http			= require('http');

var SF_UNAME 		= '';
var SF_PWD 			= '';
var CLIENT_ID 		= '';
var CLIENT_SECRET 	= '';
var CALLBACK_URI	= '';

var oauth;
var oauthJSONString='';

var org;

function login(callback){
	
	org = nforce.createConnection({
	  clientId: CLIENT_ID,
	  clientSecret: CLIENT_SECRET,
	  redirectUri: CALLBACK_URI,
	  autoRefresh: true,
	  apiVersion: 'v36.0',  		// optional, defaults to current salesforce API version
	  environment: 'production',  	// optional, salesforce 'sandbox' or 'production', production default
	  mode: 'single' 				// optional, 'single' or 'multi' user mode, multi default
	});

	org.authenticate({ username: SF_UNAME, password: SF_PWD}, function(err, resp){
	  // store the oauth object for this user
	  if(!err){ 
			oauth = resp;
			oauth = org.oauth;			
			console.log('@@@@ auth');
			console.log(oauth);
			console.log('@@@@ oauthJSONString' + oauthJSONString);
			//session.userData.isLoggedIn = true;
			//session.userData.userURL=oauth.id;
			callback(resp);

		} else {
			console.log('Error: ' + err.message);
			//session.userData.isLoggedIn = false;
			callback(err);
		}
	});
}
function querySObject(query,callback){

	org.query({ query: query,oauth: oauth }, function(err, res) {
	  if(err) return console.error(err);
	  else {
		//console.log(res.records[0]);
		callback(res.records);
		}
	});
}

//general fucntion query records from SF. Pass on the query and callback function
function getRecordsByQuery(query,callback){
	//console.log("###### query",query)

	org.query({ query: query,oauth: oauth }, function(err, res) {
		if(err) {			
			callback(err);
	  	}
		else {		
			callback(res.records);
		}
	});
}

function insertSObject(sObjectType,fieldList) {
	
	var sObject = nforce.createSObject(sObjectType);

	for(var i=0;i<fieldList.length;i++){
    	var field = fieldList[i];
    	sObject.set(field.name, field.value);
	}

	var sPromise = new Promise(function (resolve, reject) {
		org.insert({ sobject: sObject, oauth: oauth }, function (err, resp) {
			console.log('*****insertSObject*** sObjectType:'+sObjectType);
			if(resp)console.log('*****insertSObject*** resp:'+resp.id);
			if(err)console.log('*****insertSObject*** err:'+err);

			if (!err) {
				resolve(resp);
			} else {
				reject(err);
			}
		});
	});

	return sPromise;

}

var updateWithReference = function(sObjectType, referenceName, referenceValue, fieldList, additionalDetails){
	var otherFieldsName = '';
	if(additionalDetails){
		otherFieldsName = ','+additionalDetails.referenceName;
	}
	var query = 'SELECT ID, Name '+otherFieldsName+' FROM '+sObjectType+' WHERE '+referenceName+'=\''+referenceValue + '\'';
	getRecordsByQuery(query,function(records){
	console.log('*****updateWithReference***records:',records);
	console.log('*****updateWithReference***records[0]:',records[0]);
	if(records){
		var fields = records[0]["_fields"];
		console.log('*****updateWithReference***fields:',fields);
		var sObjectId = fields.id;
		console.log('*****updateWithReference***sObjectId:',sObjectId);
		updateWithId(sObjectId, sObjectType ,fieldList);

		if(additionalDetails){
			var otherSObjectType = additionalDetails.sObjectType;
			var otherFields = additionalDetails.fields;
			var otherReferenceName = additionalDetails.referenceName;

			updateWithId(fields[otherReferenceName], otherSObjectType ,otherFields);
		}
	}
	});
}
var updateWithId = function(recordId,sObjectType,fieldList) {

		var sobj = nforce.createSObject(sObjectType);
		sobj.set('id',recordId);
		console.log('#####updateWithId***recordId:',recordId);
		console.log('#####updateWithId***sObjectType:',sObjectType);
		console.log('#####updateWithId***fieldList:',fieldList);
        for(var i=0;i<fieldList.length;i++){
	    	var field = fieldList[i];
	    	 sobj.set(field.name, field.value);
	    }
	    //console.log('#####updateWithId:sobj:',sobj);

       org.update({ sobject: sobj,oauth: oauth }, function(err, resp){
			if(resp)console.log('#####updateWithId***resp:',resp);
			if(err)console.log('#####updateWithId***err:',err);
		});
}

function updateSObject(query) {	

	org.query({ query: query,oauth: oauth }, function(err, resp) {
	  if(err) return console.error(err);

	  if(!err && resp.records) {

		var acc = resp.records[0];
		acc.name = 'Global Media 111';
		
		org.update({ sobject: acc,oauth: oauth }, function(err, resp){
		  if(!err) console.log(acc);
		});

	  } 
	  
  });

}


// Platform Event Functions


// Business Network Event 


// if contact event emitted
// parse event json
// call this nforce funciton with parameters

function createBusinessNetworkEvent(eventObj,callback) {
	console.log("in sf create the object", eventObj);
	var businessNetworkEvent = nforce.createSObject('hlf__Business_Network__e');
	businessNetworkEvent.set('Name', eventObj.name);
	businessNetworkEvent.set('hlf__EventId__c', eventObj.EventId__c);
	businessNetworkEvent.set('hlf__TimeStamp__c', eventObj.Timestamp__c);

	if(eventObj.name){
		org.insert({ sobject: businessNetworkEvent, oauth: oauth }, function(err, resp){
			if(!err) {
				console.log('businessNetworkEvent posted');
				eventId = resp.id;
				callback(eventId);
			}
		
		});
	} else{
		callback("Name invalid!");
	}
}



// Business Network Event 

function createBlockchainEvent(eventObj,callback) {
	console.log("in sf create the object", eventObj);
	var blockchainEvent = nforce.createSObject('hlf__Blockchain__e');
	blockchainEvent.set('Name', eventObj.name);
	blockchainEvent.set('hlf__EventId__c', eventObj.EventId__c);
	blockchainEvent.set('hlf__TimeStamp__c', eventObj.Timestamp__c);

	if(eventObj.name){
		org.insert({ sobject: blockchainEvent, oauth: oauth }, function(err, resp){
			if(!err) {
				console.log('blockchainEvent posted');
				eventId = resp.id;
				callback(eventId);
			}
		
		});
	} else{
		callback("Name invalid!");
	}
}

exports.login = login;
exports.createBusinessNetworkEvent = createBusinessNetworkEvent;
exports.createBlockchainEvent = createBlockchainEvent;
exports.insertSObject = insertSObject;
exports.updateWithReference = updateWithReference;
exports.updateWithId = updateWithId;