public with sharing class HyperledgerShipmentCallout {
    
  private static final String requestURL = '';  
    
      public class Order {
        @InvocableVariable(label='OrderNumber')
        public String OrderNumber;
        @InvocableVariable(label='Product')
        public String OrderProduct;
        @InvocableVariable(label='Quantity')
        public Integer Quantity;
        @InvocableVariable(label='OrderId')
        public Id OrderId;
        @InvocableVariable(label='ContractId')
        public Id ContractId;
        @InvocableVariable(label='AccountId')
        public Id AccountId;          
        @InvocableVariable(label='ArrivalDate')
        public String ArrivalDate;
        @InvocableVariable(label='DeliveryDate')
        public String DeliveryDate;
         
    }
    
    @InvocableMethod(label='Post CPQ Shipment to Hyperledger 1')
    public static void postToFabric(List<Order> orders) {
        Order o = orders[0];
        Map<String,Object> msg = new Map<String,Object>();
        msg.put('$class', 'dapps.salesforce.demo.Shipment');
        msg.put('shipmentId', o.OrderNumber);
        msg.put('type', o.OrderProduct);
        msg.put('status', 'CREATED');
        msg.put('vendor', '');
        msg.put('unitCount', o.Quantity);
        msg.put('contract', '');
        msg.put('deliveryDate', o.DeliveryDate);
        msg.put('arrivalDateTime', o.ArrivalDate);
        msg.put('shipper', 'RYDER');
        msg.put('blockchainId', o.OrderNumber);
        msg.put('orderId', o.OrderId);
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
            req.setBody(body);
            Http http = new Http();
            HttpResponse res = http.send(req);
        }
 
    }
}