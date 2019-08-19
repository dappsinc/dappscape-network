trigger TemperatureReadingTrigger on Temperature_Reading__e (after insert) {

//Trigger for catching all Temperature Transaction Events
// List to hold all transations to be created.
List<dapps__Transactions__c> transactions = new List<dapps__Transactions__c>();
// Get user Id for Transaction owner
User usr = [SELECT Id FROM User WHERE Name='Albert Einstein' LIMIT 1];

    
 // Iterate through each notification.
for (Temperature_Reading__e event : Trigger.New) {

    
if (event.Type__c == 'Temperature Reading') {
// Create Transaction to track in Salesforce
dapps__Transactions__c nt = new dapps__Transactions__c();
nt.OwnerId = usr.Id;
nt.Name = 'Temperature Reading';
nt.dapps__Transaction_Status__c = 'Committed';
nt.Order__c = event.OrderId__c;
nt.Shipment__c = event.ShipmentId__c;
nt.Type__c = 'Business Network Transaction';
nt.Shipment_Status__c = event.Shipment_Status__c;
nt.Centigrade__c = event.Centigrade__c;
nt.EventId__c = event.EventId__c;
nt.dapps__TimeStamp__c = event.Timestamp__c;
transactions.add(nt);
    
}
}
    
// Insert all transactions corresponding to network transactions events received.
insert transactions;
}