// Dapps Incorporated 2020. All Rights Reserved.


public with sharing class HyperledgerParticipantCallout {

     
    // Set Named Credential
    private static final String requestURL = 'callout:hlf__Blockchain' + '/api/User';
    
    @InvocableMethod(label='Post User to Hyperledger')
    public static void postToFabric(List<UserWrapper> users) {
        UserWrapper u = users[0];
        Map<String,Object> msg = new Map<String,Object>();
        msg.put('$class', 'dapps.salesforce.crm.User');
        msg.put('userId', u.userId);
        msg.put('orgId', u.orgId);
        msg.put('firstName', u.FirstName);
        msg.put('lastName', u.LastName);
        msg.put('email', u.Email);
        msg.put('title', u.Title);
        msg.put('organization', u.Company);
        String body = JSON.serialize(msg);    
        System.enqueueJob(new QueueableFabricCall(requestURL, 'POST', body));
    }
     
    public class QueueableFabricCall implements System.Queueable, Database.AllowsCallouts {
         
        private final String url;
        private final String access_token;
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
            req.setBody(body);
            req.setHeader('Authorization','Bearer ' + access_token);
            Http http = new Http();
            HttpResponse res = http.send(req);
        }
 
    }

}