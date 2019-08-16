// Dapps Incorporated 2020. All Rights Reserved.


// Define the Asset and Create Callout
// Leverage Invocable Method in Process Builder
public with sharing class HyperledgerAccountCallout {
    
    
    // Set Named Credential
 	private static final String requestURL = 'callout:hlf__Blockchain' + '/api/Account';
    
    
    @InvocableMethod(label='Post Account to Hyperledger')
    public static void postToFabric(List<AccountWrapper> accounts) {
        AccountWrapper a = accounts[0];
        Map<String,Object> msg = new Map<String,Object>();
        msg.put('$class', 'dapps.salesforce.crm.Account');
        msg.put('accountId', a.AccountId);
        msg.put('accountName', a.AccountName);
        msg.put('type', a.AccountType);
        msg.put('phone', a.PhoneNumber);
        msg.put('industry', a.Industry);
        msg.put('accountOwner', a.Owner);
        msg.put('blockchainId', a.AccountId);
        String body = JSON.serialize(msg);    
        System.enqueueJob(new QueueableFabricCall(requestURL, 'POST', body));
    }
     
    public class QueueableFabricCall implements System.Queueable, Database.AllowsCallouts {
         
        private final String url;
        private final String method;
        private final String body;
        
        public QueueableFabricCall(String url, String method, String body) {
            this.url = url;
            this.method = method;
            this.body = body;
        }
         
        public void execute(System.QueueableContext ctx) {
            Http h = new Http();
            HttpRequest req = new HttpRequest();
            req.setHeader('Content-Type', 'application/json;charset=UTF-8');
            req.setEndpoint(url);
            req.setMethod(method);
            //req.setHeader('Authorization','Bearer ' + access_token);
            req.setBody(body);
            Http http = new Http();
            HttpResponse res = http.send(req);
        }
 
    }

}