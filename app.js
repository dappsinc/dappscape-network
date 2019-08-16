// BASE SETUP
// =============================================================================

// call the packages we need

var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var path = require('path');
var request = require('request');
let helmet = require('helmet');

//var filter = require('./filter');
let salesforce = require('./salesforce');
const encryptService = require('./encrypt.js');
const CRMNetwork = require('./crmNetwork');
let http = require('http');

let OauthCache = {};
let deploymentTime = new Date();

salesforce.login(function (val){
	//console.log("#####loggedIn", val);
	try{
		//filter.runFilter();
	}catch(ex){
		console.log('####### runfilter ex ', ex);
	}
});



// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet.noCache());
app.use(helmet.noSniff());
app.use(helmet.hidePoweredBy());
app.use(helmet.expectCt({ maxAge: 30 * 24 * 60 *60 })); // 30 Days
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'"]
  }
}));


app.use(helmet.hsts({
  // ...
  setIf: function (req, res) {
    if (req.secure) {
      return true
    } else {
      return false
    }
  }
}))

var sixtyDaysInSeconds = 5184000;
app.use(helmet.hsts({
setIf: function (req, res) {
    if (req.secure) {
      return true
    } else {
      return false
    }
  },
  maxAge: sixtyDaysInSeconds,
  includeSubDomains : false
}));


app.use(helmet.frameguard({ action: 'deny' }));//sameorigin
app.use(helmet());
app.disable('x-powered-by');


var allowCrossDomain = function(req,res,next){
	res.header('Access-Control-Allow-Origin','*');
	res.header('Access-Control-Allow-Methods','PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers','Content-Type, Authorization,Accept');
	next();
}

app.use(allowCrossDomain);


var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router








//*************************************************   CRM ASSET APIS     ********************************** */

// CRM Assets APIs

// Create Account

router.post('/createAccount', function (req, res) {
	var transactionData = req.body.transactionData;
	var cardName = req.header.authorization;
	var crmNetwork = new CRMNetwork(cardName);


	crmNetwork.init().then(function () {
		return crmNetwork.createAccount(transactionData)
	}).then(function () {
		res.json({ success: true })
	}).catch(function (error) {
		res.status(500).json({error: error.toString()})
	})
})

// Create Lead

router.post('/createLead', function (req, res) {
	var transactionData = req.body.transactionData;
	var cardName = req.header.authorization;
	var crmNetwork = new CRMNetwork(cardName);


	crmNetwork.init().then(function () {
		return crmNetwork.createLead(transactionData)
	}).then(function () {
		res.json({ success: true })
	}).catch(function (error) {
		res.status(500).json({error: error.toString()})
	})
})


// Create Contact

router.post('/createContact', function (req, res) {
	var transactionData = req.body.transactionData;
	var cardName = req.header.authorization;
	var crmNetwork = new CRMNetwork(cardName);


	crmNetwork.init().then(function () {
		return crmNetwork.createContact(transactionData)
	}).then(function () {
		res.json({ success: true })
	}).catch(function (error) {
		res.status(500).json({error: error.toString()})
	})
})












//*************************************************   CRM PARTICIPANT APIS     ********************************** */

// CRM Participant APIs

// Create User

router.post('/createUser', function (req, res) {
	var transactionData = req.body.transactionData;
	var cardName = req.header.authorization;
	var crmNetwork = new CRMNetwork(cardName);


	crmNetwork.init().then(function () {
		return crmNetwork.createUser(transactionData)
	}).then(function () {
		res.json({ success: true })
	}).catch(function (error) {
		res.status(500).json({error: error.toString()})
	})
})

// Issue Identity

router.post('/issueIdentity', function (req, res) {
	var transactionData = req.body.transactionData;
	var cardName = req.header.authorization;
	var crmNetwork = new CRMNetwork(cardName);

	crmNetwork.init().then(function () {
		return crmNetwork.issueIdentity(transactionData)
	}).then(function () {
		res.json({ success: true })
	}).catch(function (error) {
		res.status(500).json({error: error.toString()})
	})
})


// Bind Identity

router.post('/bindIdentity', function (req, res) {
	var transactionData = req.body.transactionData;
	var cardName = req.header.authorization;
	var crmNetwork = new CRMNetwork(cardName);

	crmNetwork.init().then(function () {
		return crmNetwork.bindIdentity(transactionData)
	}).then(function () {
		res.json({ success: true })
	}).catch(function (error) {
		res.status(500).json({error: error.toString()})
	})
})



//*************************************************   NETWORK APIS     ********************************** */


// Login to Business Network using a passport and salesforce strategy 



router.post('/login'), function (req, res) {
	salesforceNetwork.importCardToNetwork(req.files.card.data).then(function(idCardName) {
        if (!idCardName) {
            res.status(403).json({message: "Logging failed"});
        }
        res.json({message: "Logging Successful", accessToken: idCardName})    
    }).catch(function (error) {
        res.status(403).json({message: "Login failed", error: error.toString()})    
    })
};


// Card Logout using passport and salesforce strategy

router.post('/logout'), function (req, res) {
	var cardName = req.headers.authorization;
    var salesforcenetwork = new SalesforceNetwork(cardName);

    salesforcenetwork.init().then(function () {
        return salesforcenetwork.logout()
    }).then(function () { 
        res.json({ message: "User added Successfully" });
    }).catch(function(error) {
        console.log(error);
        res.status(500).json({ error: error.toString() })
    })

};



// Ping Business Network 

router.post('/ping', function(req, res) {    
    networkAdmin.pingNetwork(req.body,    		
    		function(error,result){
    			console.log("####### results", result);
    			
		    	if(result){
		    		res.send(result);		    		
		    	}else if(error){
		    		//console.log("####### error", error);
		    		res.send(String(error));			    		
		    	}else{
		    		res.send("Something went wrong, please refresh and try again!");	
		    	}
		     });    
});




router.post('/verifyOrganization', function(req, res) {
	let devconsole = logger.getLogger('***Index.js***parseServerRequest***');
	devconsole.debug('***Enter in Method***');
	devconsole.debug('***req***',req.body);

	var datajson = req.body;
	var reqStrEncrypted = datajson.reqStr;
	const orgId = datajson.orgId;

	const privateKey = '';
	let parsedRequest = encryptService.parseServerRequest(reqStrEncrypted,privateKey);
	
	devconsole.debug('***parsedRequest***',parsedRequest);

	let aesKey = parsedRequest.privateKey;
	let orgObjUpsert = {
	    id : orgId,
	    information :  aesKey
	};

	devconsole.debug('***orgObjUpsert***',orgObjUpsert);
	daoService.createOrUpdateOrg(orgObjUpsert)
	.then(function(isCreated){
		devconsole.debug('***orgObj.isCreated***',isCreated);

		var response = {} ;
		
		let responseToBeSent = encryptService.packageResponse(response,privateKey, function(response){
			response.message = 'Organization verified successfully';
		});

		res.json(responseToBeSent);
	});
});




router.post('/verifyOrganization2', function(req, res) {
	let devconsole = logger.getLogger('***index.js***sendTransactionSign2***');

    var jsonBody = req.body;
    devconsole.debug('***jsonBody***',jsonBody);
    let reqStrEncrypted = jsonBody.reqStr;
    let orgId = jsonBody.orgId;
    const MASTER_KEY = '';
    var reqPromise = encryptService.parseServerRequestWithMasterKey(reqStrEncrypted,orgId);
	reqPromise.then(
		function(parsedRequest){
			devconsole.debug('***parsedRequest***',parsedRequest);
			let dataStr = parsedRequest.dataStr;
			let _data = JSON.parse(dataStr);
			devconsole.debug('***_data***',_data);

			let aesKey = _data.privateKey;
			let orgObjUpsert = {
			    id : orgId,
			    secretKey :  aesKey
			};

			devconsole.debug('***orgObjUpsert***',orgObjUpsert);
			daoService.createOrUpdateOrg(orgObjUpsert)
			.then(function(isCreated){
				devconsole.debug('***orgObj.isCreated***',isCreated);

				var response = {} ;
				
				let responseToBeSent = encryptService.packageResponse(response,MASTER_KEY, function(response){
					response.message = 'Organization verified successfully';
				});

				res.json(responseToBeSent);
			});
		}
	).catch(function(error){
		devconsole.debug('***error of reqPromise***',error);
		res.send(error);
	});

});


//*************************************************   BUSINESS NETWORK EXPLORER APIS     ********************************** */

// Business Network Explorer APIs to be called via Remote Action in BusinessNetworkExplorer VFP and Controller 




router.post('/system/historian', function (req, res) {
	var transactionData = req.body.transactionData;
	var cardName = req.header.authorization;
	var salesforcenetwork = new SalesforceNetwork(cardName);


	salesforcenetwork.init().then(function () {
		return salesforcenetwork.getNetworkHistory(transactionData)
	}).then(function () {
		res.json({ success: true })
	}).catch(function (error) {
		res.status(500).json({error: error.toString()})
	})
});



// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);


//serving pages and static files
app.use('/', express.static('static'))
app.use('/.well-known/', express.static(path.join(__dirname, '.well-known')));

//serving pages

app.get('/', function(req, res) {
    //res.sendFile(path.join(__dirname + '/dappsnetwork.html'));
    res.send('Welcome to the CRM Network');
     //return res.redirect('http://dapps.ai/');
});

//----salesforce callback 
app.get("/oauth/callback", function (req, res) {                
	//console.log("#########", req);	
    salesforceEndpoint.respondToSFDCCallback(req, res);
}); 
//----salesforce callback  end

/*
app.get('/compiler', function(req, res) {
    res.sendFile(path.join(__dirname + '/testing/SolidityCompiler.html'));
});
app.get('/createcontract', function(req, res) {
    res.sendFile(path.join(__dirname + '/testing/AbiToHTML.html'));
});
*/
// START THE SERVER
// =============================================================================
app.listen(port);
exports.app = app;
console.log('Magic happens on port ' + port);


// These functions may update the state of resources stored on the Blockchain via server-side Hyperledger Composer APIs.