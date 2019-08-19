trigger LightReadingTrigger on Light_Reading__e (after insert) {

//Trigger for catching all Temperature Transaction Events
    
// List to hold all transations to be created.
List<dapps__Transactions__c> transactions = new List<dapps__Transactions__c>();
// Get user Id for Transaction owner
    
 // Iterate through each notification.
for (Light_Reading__e event : Trigger.New) {

if (event.Type__c == 'Light Reading') {
// Create Transaction to track in Salesforce
dapps__Transactions__c nt = new dapps__Transactions__c();
nt.Name = 'Light Reading';
nt.dapps__Transaction_Status__c = 'Committed';
nt.Order__c = event.OrderId__c;
nt.Shipment__c = event.Shipment__c;
nt.Exposure__c = event.Exposure__c;
nt.Type__c = 'Business Network Transaction';
nt.EventId__c = event.EventId__c;
nt.Shipment_Status__c = event.Shipment_Status__c;
nt.dapps__TimeStamp__c = event.Timestamp__c;
transactions.add(nt);
}
    
    
    
}
// Insert all Light Readings corresponding to network transactions events received.
insert transactions;
}