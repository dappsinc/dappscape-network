// Dapps Incorporated 2020. All Rights Reserved.

@isTest
public class HyperledgerAccountConnectionTest {
    
    static testMethod void testAll() {
        
    hlf__NodeSettings__c orgWiseProperty = new hlf__NodeSettings__c();
    orgWiseProperty.Name='Properties';
    orgWiseProperty.hlf__Fabric_Key__c = 'dapps1234567890';
    orgWiseProperty.hlf__Fabric_Server_URL__c = 'https://salesforceblockchain.com';
    orgWiseProperty.hlf__Organization_Id__c = '';
    orgWiseProperty.hlf__Private_Key__c = '0123456789012345678901';
    //insert orgWiseProperty;
        
    
    HyperledgerAccountConnection con2 = new HyperledgerAccountConnection(null);
	HyperledgerAccountConnection conn = new HyperledgerAccountConnection();
    conn.sync();
        
        conn.mapColumnName('$class');
        conn.mapColumnName('Id');
        conn.mapColumnName('Name');
        conn.mapColumnName('Type');
        conn.mapColumnName('Phone');
        conn.mapColumnName('Industry');
        conn.mapColumnName('ExternalId');
        conn.mapColumnName('DisplayUrl');
        conn.mapColumnName('');
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