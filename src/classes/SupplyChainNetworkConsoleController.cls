public with sharing class SupplyChainNetworkConsoleController {
    
    @AuraEnabled
public static String getSessionId() {
  return UserInfo.getSessionId();
}
    
    public static void publishNotifications(List<String> messages) {
  List<SupplyChain_Network_Event__e> notifications = new List<SupplyChain_Network_Event__e>();
  for (String message: messages) {
    notifications.add(new SupplyChain_Network_Event__e(Message__c = message));
  }

  List<Database.SaveResult> results = EventBus.publish(notifications);

  // Inspect publishing results
  for (Database.SaveResult result : results) {
    if (!result.isSuccess()) {
      for (Database.Error error : result.getErrors()) {
        System.debug('Error returned: ' +
               error.getStatusCode() +' - '+
               error.getMessage());
      }
    }
  }
}

}