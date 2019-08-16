// Dapps Incorporated 2020. All Rights Reserved.

@isTest
public class HyperledgerHistorianConnectionTest {
    
    static testMethod void testAll() {
        
    hlf__NodeSettings__c orgWiseProperty = new hlf__NodeSettings__c();
    orgWiseProperty.Name='Properties';
    orgWiseProperty.hlf__Fabric_Key__c = '12345';
    orgWiseProperty.hlf__Fabric_Server_URL__c = 'https://salesforceblockchain.com';
    orgWiseProperty.hlf__Organization_Id__c = '';
    orgWiseProperty.hlf__Private_Key__c = '0123456789012345678901';
    //insert orgWiseProperty;
        
    
    HyperledgerHistorianConnection con2 = new HyperledgerHistorianConnection(null);
	HyperledgerHistorianConnection conn = new HyperledgerHistorianConnection();
    conn.sync();
        
        conn.mapColumnName('$class');
        conn.mapColumnName('transactionType');
        conn.mapColumnName('transactionInvoked');
        conn.mapColumnName('participantInvoking');
        conn.mapColumnName('identityUsed');
        conn.mapColumnName('eventsEmitted');
        conn.mapColumnName('transactionTimestamp');


        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator('{"Anything":"Anything"}'));
        conn.getData('URL');
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator('{"items":[]}'));
        conn.getData('URL');
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator('{"error":{"errors" : [{"message":"msg"}]}}'));
        conn.getData('URL');
        
       Map<String, Object> item = new Map<String, Object>();
        item.put('blockchainId','blockchainId');
        
        conn.createRow(item);
        


	}
   
}