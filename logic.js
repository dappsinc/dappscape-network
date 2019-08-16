/**
 *
 * Dappscape CRM.
 *
 * Dapps Incorporated. 2019. All rights reserved.
 *
 */

/**
 * Transfer Account to another User
 * @param  {dapps.salesforce.crm.TransferAccount} transferAccount - the transferAccount transaction
 * @transaction
 */
async function transferAccount(transferAccount) {   // eslint-disable-line no-unused-vars
    transferAccount.account.accountOwner = transferAccount.newOwner;
    const assetRegistry = await getAssetRegistry('dapps.salesforce.crm.Account');
    await assetRegistry.update(transferAccount.account);
  
	const accountTransferEvent = getFactory().newEvent('dapps.salesforce.crm', 'AccountTransferEvent');
      accountTransferEvent.account = transferAccount.account;
      accountTransferEvent.newOwner = transferAccount.newOwner;
      emit(accountTransferEvent);

}


/**
 * Transfer Contact to another User
 * @param  {dapps.salesforce.crm.TransferContact} transferContact - the transferContact transaction
 * @transaction
 */
async function transferContact(transferContact) {   // eslint-disable-line no-unused-vars
    transferContact.contact.contactOwner = transferContact.newOwner;
    const assetRegistry = await getAssetRegistry('dapps.salesforce.crm.Contact');
    await assetRegistry.update(transferContact.contact);
  
  
  	const contactTransferEvent = getFactory().newEvent('dapps.salesforce.crm', 'ContactTransferEvent');
      contactTransferEvent.contact = transferContact.contact;
      contactTransferEvent.newOwner = transferContact.newOwner;
      emit(contactTransferEvent);

}



/**
 * Transfer Lead to another User
 * @param  {dapps.salesforce.crm.TransferLead} transferLead - the transferLead transaction
 * @transaction
 */
async function transferLead(transferLead) {   // eslint-disable-line no-unused-vars
    transferLead.lead.leadOwner = transferLead.newOwner;
    const assetRegistry = await getAssetRegistry('dapps.salesforce.crm.Lead');
    await assetRegistry.update(transferLead.lead);


	const leadTransferEvent = getFactory().newEvent('dapps.salesforce.crm', 'LeadTransferEvent');
      leadTransferEvent.lead = transferLead.lead;
      leadTransferEvent.newOwner = transferLead.newOwner;
      emit(leadTransferEvent);

}




/**
 * A shipment has been received by an importer
 * @param {dapps.salesforce.crm.ShipmentReceived} shipmentReceived - the ShipmentReceived transaction
 * @transaction
 */
function payOut(shipmentReceived) {

    var contract = shipmentReceived.shipment.contract;
    var shipment = shipmentReceived.shipment;
    var payOut = contract.unitPrice * shipment.unitCount;

    console.log('Received at: ' + shipmentReceived.timestamp);
    console.log('Contract arrivalDateTime: ' + contract.arrivalDateTime);

    // set the status of the shipment
    shipment.status = 'ARRIVED';
    contract.status = 'INEFFECT';

    // if the shipment did not arrive on time the payout is zero
    if (shipmentReceived.timestamp > contract.arrivalDateTime) {
        payOut = 0;
        console.log('Late shipment');
    } else {
        // find the lowest temperature reading
        if (shipment.temperatureReadings) {
            // sort the temperatureReadings by centigrade
            shipment.temperatureReadings.sort(function (a, b) {
                return (a.centigrade - b.centigrade);
            });
            var lowestReading = shipment.temperatureReadings[0];
            var highestReading = shipment.temperatureReadings[shipment.temperatureReadings.length - 1];
            var penalty = 0;
            console.log('Lowest temp reading: ' + lowestReading.centigrade);
            console.log('Highest temp reading: ' + highestReading.centigrade);

            // does the lowest temperature violate the contract?
            if (lowestReading.centigrade < contract.minTemperature) {
                penalty += (contract.minTemperature - lowestReading.centigrade) * contract.minPenaltyFactor;
                console.log('Min temp penalty: ' + penalty);
            }

            // does the highest temperature violate the contract?
            if (highestReading.centigrade > contract.maxTemperature) {
                penalty += (highestReading.centigrade - contract.maxTemperature) * contract.maxPenaltyFactor;
                console.log('Max temp penalty: ' + penalty);
            }

            // apply any penalities
            payOut -= (penalty * shipment.unitCount);

            if (payOut < 0) {
                payOut = 0;
            }
        }
    }

    console.log('Payout: ' + payOut);
    contract.supplier.bitcoinBalance += payOut;
    contract.buyer.bitcoinBalance -= payOut;



    return getParticipantRegistry('dapps.salesforce.crm.Supplier')
        .then(function (supplierRegistry) {
            // update the grower's balance
            return supplierRegistry.update(contract.supplier);
        })
        .then(function () {
            return getParticipantRegistry('dapps.salesforce.crm.Buyer');
        })
        .then(function (buyerRegistry) {
            // update the importer's balance
            return buyerRegistry.update(contract.buyer);
        })
        .then(function () {
            return getAssetRegistry('dapps.salesforce.crm.Shipment');
        })
        .then(function (shipmentRegistry) {
            // update the state of the shipment
            return shipmentRegistry.update(shipment);
    })
        .then(function () { 

    var shipmentReceivedEvent = getFactory().newEvent('dapps.salesforce.crm', 'ShipmentReceivedEvent');
      shipmentReceivedEvent.Shipment__c = shipmentReceived.shipment;
      shipmentReceivedEvent.OrderId__c = shipment.orderId;
      shipmentReceivedEvent.ShipmentId__c = shipment.shipmentId;
      shipmentReceivedEvent.Shipment_Status__c = shipment.status;
      shipmentReceivedEvent.Contract__c = shipment.contract;
      emit(shipmentReceivedEvent);
});
  
  
}



/**
@param {dapps.salesforce.crm.CollectionReplenished} collectionReplenished - the collectionReplenished transaction
*/

function productAssortment(collectionReplenished) {
  
  var product = assortment.product;
  var assortmentReplenished = product.quantity;
  
  if (productAssortment.product.inStock = 0 ) {
    
   product.inStock += productAssortment;
    
  } else {
    
    product.inventoryStatus = 'INSTOCK';
    
  }
  
  return getAssetRegistry('dapps.salesforce.crm.Product')
  			.then(function (productRegistry) {
    		//update the state of the product registry aka inventory aka collection
    			return productRegistry.update(product);
  			})
  			.then(function () {
    			return getAssetRegistry('dapps.salesforce.crm.Order');
  			})
  			.then(function (orderRegistry) {
    			//update the state of the order
    			return orderRegistry.update(order);
  			})
  			.then( function () {
    		
    	var replenishmentEvent = getFactory.newEvent('dapps.salesforce.crm', 'ReplenishmentEvent');
    		replenishmentEvent.ProductId__c = collectionReplenished.productId;
    		replenishmentEvent.Quantity__c = collectionReplenished.quantity;
    		replenishmentEvent.Status__c = collectionReplenished.status;
    
    
    		emit(replenishmentEvent);
    
  });
  
}
      
      
      
  
  



/**
 * A Product in the Vendor's Inventory has been ordered by a Retailer
@param {dapps.salesforce.crm.ProductOrdered} productOrdered - the ProductOrdered transaction
* @transaction
*/

function inventoryDeduction(productOrdered) {

var order = productOrdered.order;
var product = productOrdered.product;
var vendor = productOrdered.product.vendor;
var inventoryDeduction = order.quantity;

// set the status of the product and order
order.status = "ACTIVATED";

if (productOrdered.product.inStock > 0 ) {

    console.log(inventoryDeduction)
    product.inStock -= inventoryDeduction;

} else {
      
    product.inventoryStatus = 'OUTOFSTOCK';
  }

return getAssetRegistry('dapps.salesforce.crm.Product')
        .then(function (productRegistry) {
            // update the state of the product registry aka inventory
            return productRegistry.update(product);
        })
        .then(function () {
            return getAssetRegistry('dapps.salesforce.crm.Order');
        })
        .then(function (orderRegistry) {
            // update the state of the order
            return orderRegistry.update(order);
        })
        .then( function () {

    var deductionEvent = getFactory().newEvent('dapps.salesforce.crm', 'DeductionEvent');
      deductionEvent.OrderId__c = productOrdered.orderId;
      deductionEvent.Quantity__c = productOrdered.quantity;
      deductionEvent.Status__c = productOrdered.status;

      emit(deductionEvent);
});
  
  
}

/**
 * 
 * @param {dapps.salesforce.crm.OrderConfirmed} orderConfirmed - the OrderConfirmed transaction
 * @transaction
 */


function orderConfirmed(orderConfirmed) {

    var order = orderConfirmed.order;
    order.status = 'CONFIRMED';


    return getAssetRegistry('dapps.salesforce.crm.Order')
        .then(function (orderRegistry) {
            // add the temp reading to the shipment
            return orderRegistry.update(order);
        })
  .then(function () { 

    var orderConfirmedEvent = getFactory().newEvent('dapps.salesforce.crm', 'OrderConfirmedEvent');
      orderConfirmedEvent.Order__c = orderConfirmed.order;
      orderConfirmedEvent.Order_Status__c = order.status;

      emit(orderConfirmedEvent);
});

  
}


/**
 * A temperature reading has been received for a shipment
 * @param {dapps.salesforce.crm.OrderChanged} orderChanged - the OrderChanged transaction
 * @transaction
 */


function orderChanged(orderChanged) {

    var order = orderChanged.order;
    order.status = 'CONFIRMED';
    order.color = 'CHARCOAL';


    return getAssetRegistry('dapps.salesforce.crm.Order')
        .then(function (orderRegistry) {
            // add the temp reading to the shipment
            return orderRegistry.update(order);
        })
  .then(function () { 

    var orderChangedEvent = getFactory().newEvent('dapps.salesforce.crm', 'OrderChangedEvent');
      orderChangedEvent.Order__c = orderChanged.order;
      orderChangedEvent.Order_Status__c = order.status;
      orderChangedEvent.Order_Color__c = order.color;

      emit(orderChangedEvent);
});

  
}


/**
 * A temperature reading has been received for a shipment
 * @param {dapps.salesforce.crm.LightReading} lightReading - the LightReading transaction
 * @transaction
 */
function lightReading(lightReading) {

    var shipment = lightReading.shipment;
    shipment.status = 'INTRANSIT';
    var shipper = lightReading.shipment.shipper;
   
    // Save the old value of the shipment  
    //var oldValue = shipment.centigrade;
   // Update the shipment with the new value
  //    temperatureReading.centigrade = temperatureReading.newValue;

    console.log('Adding light exposure ' + lightReading.exposure + ' to shipment ' + shipment.$identifier);

    if (shipment.lightReadings) {
        shipment.lightReadings.push(lightReading);
    } else {
        shipment.lightReadings = [lightReading];
    }

    return getAssetRegistry('dapps.salesforce.crm.Shipment')
        .then(function (shipmentRegistry) {
            // add the temp reading to the shipment
            return shipmentRegistry.update(shipment);
        })
  .then(function () { 

    var lightReadingEvent = getFactory().newEvent('dapps.salesforce.crm', 'LightReadingEvent');
      lightReadingEvent.Shipment__c = lightReading.shipment;
      lightReadingEvent.Exposure__c = lightReading.exposure;
      lightReadingEvent.ShipmentId__c = lightReading.shipmentId;
      lightReadingEvent.OrderId__c = lightReading.orderId;
      lightReadingEvent.Shipment_Status__c = shipment.status;
      emit(lightReadingEvent);
});

  
}



/**
 * A temperature reading has been received for a shipment
 * @param {dapps.salesforce.crm.HumidityReading} humidityReading - the Humidity Reading transaction
 * @transaction
 */
function humidityReading(humidityReading) {

    var shipment = humidityReading.shipment;
    shipment.status = 'INTRANSIT';
    var shipper = humidityReading.shipment.shipper;
   
    // Save the old value of the shipment  
    //var oldValue = shipment.centigrade;
   // Update the shipment with the new value
  //    temperatureReading.centigrade = temperatureReading.newValue;

    console.log('Adding humidty ' + humidityReading.relativeHumidity + ' to shipment ' + shipment.$identifier);

    if (shipment.humidityReadings) {
        shipment.humidityReadings.push(humidityReading);
    } else {
        shipment.humidityReadings = [humidityReading];
    }

    return getAssetRegistry('dapps.salesforce.crm.Shipment')
        .then(function (shipmentRegistry) {
            // add the temp reading to the shipment
            return shipmentRegistry.update(shipment);
        })
  .then(function () { 

    var humidityEvent = getFactory().newEvent('dapps.salesforce.crm', 'HumidityEvent');
      humidityEvent.Shipment__c = humidityReading.shipment;
      humidityEvent.Relative_Humidity__c = humidityReading.centigrade;
      humidityEvent.ShipmentId__c = humidityReading.shipmentId;
      humidityEvent.OrderId__c = humidityReading.orderId;
      humidityEvent.Shipment_Status__c = shipment.status;
      emit(humidityEvent);
});

  
}




/**
 * A shipment has reached Customs
 * @param {dapps.salesforce.crm.ArrivedCustoms} arrivedCustoms - the Arrived Customs Transaction
 */
function arrivedCustoms(arrivedCustoms) {

    var shipment = arrivedCustoms.shipment;
    shipment.status = 'INCUSTOMS';
    var shipper = arrivedCustoms.shipment.shipper;

    return getAssetRegistry('dapps.salesforce.crm.Shipment')
        .then(function (shipmentRegistry) {
            // add the temp reading to the shipment
            return shipmentRegistry.update(shipment);
        })
  .then(function () { 

    var customsEvent = getFactory().newEvent('dapps.salesforce.crm', 'CustomsEvent');
      customsEvent.Shipment__c = arrivedCustoms.shipment;
      customsEvent.Centigrade__c = arrivedCustoms.centigrade;
      customsEvent.ShipmentId__c = arrivedCustoms.shipmentId;
      customsEvent.OrderId__c = arrivedCustoms.orderId;
      customsEvent.Shipment_Status__c = arrivedCustoms.status;
      emit(customsEvent);
});

  
}


/**
 * A shipment has reached Customs
 * @param {dapps.salesforce.crm.ShipmentDelayed} shipmentDelayed - the Shipment Delayed Transaction
 */
function shipmentDelayed(shipmentDelayed) {

    var shipment = shipmentDelayed.shipment;
    shipment.status = 'DELAYED';
    var shipper = shipmentDelayed.shipment.shipper;

    return getAssetRegistry('dapps.salesforce.crm.Shipment')
        .then(function (shipmentRegistry) {
            // add the temp reading to the shipment
            return shipmentRegistry.update(shipment);
        })
  .then(function () { 

    var delayedEvent = getFactory().newEvent('dapps.salesforce.crm', 'ShipmentDelayedEvent');
      delayedEvent.Shipment__c = shipmentDelayed.shipment;
      delayedEvent.Centigrade__c = shipmentDelayed.centigrade;
      delayedEvent.ShipmentId__c = shipmentDelayed.shipmentId;
      delayedEvent.OrderId__c = shipmentDelayed.orderId;
      delayedEvent.Shipment_Status__c = shipmentDelayed.status;
      emit(delayedEvent);
});

  
}


/**
 * A shipment has reached Customs
 * @param {dapps.salesforce.crm.InDrayage} inDrayage - the Drayage Transaction
 */
function inDrayage(inDrayage) {

    var shipment = inDrayage.shipment;
    shipment.status = 'DRAYAGE';
    var shipper = inDrayage.shipment.shipper;

    return getAssetRegistry('dapps.salesforce.crm.Shipment')
        .then(function (shipmentRegistry) {
            // add the temp reading to the shipment
            return shipmentRegistry.update(shipment);
        })
  .then(function () { 

    var drayageEvent = getFactory().newEvent('dapps.salesforce.crm', 'DrayageEvent');
      drayageEvent.Shipment__c = inDrayage.shipment;
      drayageEvent.ShipmentId__c = inDrayage.shipmentId;
      drayageEvent.OrderId__c = inDrayage.orderId;
      drayageEvent.Shipment_Status__c = inDrayage.status;
      emit(drayageEvent);
});

  
}



/**
 * A shipment has reached Customs
 * @param {dapps.salesforce.crm.DeliveryDateChange} DeliveryDateChange- the Delivery Date Change Transaction
 */
function deliveryDateChange(deliveryDateChange) {

    var shipment = deliveryDateChange.shipment;
    shipment.status = 'DATECHANGE';
    var shipper = deliveryDateChange.shipment.shipper;
    var newDeliveryDate = deliveryDateChange.shipment.contract.arrivalDateTime;

    return getAssetRegistry('dapps.salesforce.crm.Shipment')
        .then(function (shipmentRegistry) {
            // add the temp reading to the shipment
            return shipmentRegistry.update(shipment);
        })
  .then(function () { 

    var deliveryDateChangeEvent = getFactory().newEvent('dapps.salesforce.crm', 'DeliveryDateChangeEvent');
      deliveryDateChangeEvent.Shipment__c = deliveryDateChange.shipment;
      deliveryDateChangeEvent.ShipmentId__c = deliveryDateChange.shipmentId;
      deliveryDateChangeEvent.OrderId__c = deliveryDateChange.orderId;
      deliveryDateChangeEvent.Shipment_Status__c = deliveryDateChange.status;

      emit(deliveryDateChangeEvent);
});

  
}




/**
 * A temperature reading has been received for a shipment
 * @param {dapps.salesforce.crm.TemperatureReading} temperatureReading - the TemperatureReading transaction
 * @transaction
 */
function temperatureReading(temperatureReading) {

    var shipment = temperatureReading.shipment;
    shipment.status = 'INTRANSIT';
    var shipper = temperatureReading.shipment.shipper;
   
    // Save the old value of the shipment  
    //var oldValue = shipment.centigrade;
   // Update the shipment with the new value
  //  temperatureReading.centigrade = temperatureReading.newValue;

    console.log('Adding temperature ' + temperatureReading.centigrade + ' to shipment ' + shipment.$identifier);

    if (shipment.temperatureReadings) {
        shipment.temperatureReadings.push(temperatureReading);
    } else {
        shipment.temperatureReadings = [temperatureReading];
    }

    return getAssetRegistry('dapps.salesforce.crm.Shipment')
        .then(function (shipmentRegistry) {
            // add the temp reading to the shipment
            return shipmentRegistry.update(shipment);
        })
  .then(function () { 

    var temperatureEvent = getFactory().newEvent('dapps.salesforce.crm', 'TemperatureEvent');
      temperatureEvent.Shipment__c = temperatureReading.shipment;
      temperatureEvent.Centigrade__c = temperatureReading.centigrade;
      temperatureEvent.ShipmentId__c = temperatureReading.shipmentId;
      temperatureEvent.OrderId__c = temperatureReading.orderId;
      temperatureEvent.Shipment_Status__c = shipment.status;
      emit(temperatureEvent);
});

  
}

/**
 * @param {dapps.salesforce.crm.ShipmentEventTransaction} shipmentEventTransaction
 * @transaction
 */
function shipmentEventTransaction(shipmentEventTransaction) {
    var factory = getFactory();

    var shipmentEvent = factory.newEvent('dapps.salesforce.crm', 'ShipmentEvent');
    emit(shipmentEvent);
}

/**
 * @param {dapps.salesforce.crm.BuyerEventTransaction} buyerEventTransaction
 * @transaction
 */
function buyerEventTransaction(temperatureEventTransaction) {
    var factory = getFactory();

    var buyerEvent = factory.newEvent('dapps.salesforce.crm', 'BuyerEvent');
    emit(buyerEvent);
}


/**
 * @param {dapps.salesforce.crm.SupplierEventTransaction} supplierEventTransaction
 * @transaction
 */
function supplierEventTransaction(supplierEventTransaction) {
    var factory = getFactory();

    var supplierEvent = factory.newEvent('dapps.salesforce.crm', 'SupplierEvent');
    emit(supplierEvent);
}



/**
 * Initialize some test assets and participants useful for running a crm.
 * @param {dapps.salesforce.crm.SetupSupplyChain} SetupSupplyChain - the SetupCupplyChain transaction
 * @transaction
 */
function setupSupplyChain(setupSupplyChain) {

    var factory = getFactory();
    var NS = 'dapps.salesforce.crm';

    // create the supplier
    var supplier = factory.newResource(NS, 'Supplier', 'ACME');
    var supplierAddress = factory.newConcept(NS, 'Address');
    supplierAddress.country = 'USA';
    supplier.address = supplierAddress;
    supplier.bitcoinBalance = 0;

    // create the buyer
    var buyer = factory.newResource(NS, 'Buyer', 'Walmart');
    var buyerAddress = factory.newConcept(NS, 'Address');
    buyerAddress.country = 'USA';
    buyer.address = buyerAddress;
    buyer.bitcoinBalance = 0;

    // create the shipper
    var shipper = factory.newResource(NS, 'Shipper', 'Ryder');
    var shipperAddress = factory.newConcept(NS, 'Address');
    shipperAddress.country = 'USA';
    shipper.address = shipperAddress;
    shipper.bitcoinBalance = 0;

    // create the contract
    var contract = factory.newResource(NS, 'Contract', 'CONTRACT_1');
    contract.supplier = factory.newRelationship(NS, 'Supplier', 'ACME');
    contract.buyer = factory.newRelationship(NS, 'Buyer', 'Walmart');
    contract.shipper = factory.newRelationship(NS, 'Shipper', 'Ryder');
    var tomorrow = setupSupplyChain.timestamp;
    tomorrow.setDate(tomorrow.getDate() + 1);
    contract.status = 'INEFFECT';
    contract.arrivalDateTime = tomorrow; // the shipment has to arrive tomorrow
    contract.unitPrice = 0.5; // pay 50 cents per unit
    contract.minTemperature = 2; // min temperature for the cargo
    contract.maxTemperature = 10; // max temperature for the cargo
    contract.minPenaltyFactor = 0.2; // we reduce the price by 20 cents for every degree below the min temp
    contract.maxPenaltyFactor = 0.1; // we reduce the price by 10 cents for every degree above the max temp

    // create the shipment
    var shipment = factory.newResource(NS, 'Shipment', 'SHIPMENT_1');
    shipment.type = 'LUXURY';
    shipment.status = 'CREATED';
    shipment.unitCount = 500;
    shipment.shipper = factory.newRelationship(NS, 'Shipper', 'Ryder');
    shipment.contract = factory.newRelationship(NS, 'Contract', 'CONTRACT_1');
    return getParticipantRegistry(NS + '.Supplier')
        .then(function (supplierRegistry) {
            // add the growers
            return supplierRegistry.addAll([supplier]);
        })
        .then(function() {
            return getParticipantRegistry(NS + '.Buyer');
        })
        .then(function(buyerRegistry) {
            // add the importers
            return buyerRegistry.addAll([buyer]);
        })
        .then(function() {
            return getParticipantRegistry(NS + '.Shipper');
        })
        .then(function(shipperRegistry) {
            // add the shippers
            return shipperRegistry.addAll([shipper]);
        })
        .then(function() {
            return getAssetRegistry(NS + '.Contract');
        })
        .then(function(contractRegistry) {
            // add the contracts
            return contractRegistry.addAll([contract]);
        })
        .then(function() {
            return getAssetRegistry(NS + '.Shipment');
        })
        .then(function(shipmentRegistry) {
            // add the shipments
            return shipmentRegistry.addAll([shipment]);
    })
        .then(function () { 

    var newShipmentEvent = getFactory().newEvent('dapps.salesforce.crm', 'NewShipmentEvent');
      newShipmentEvent.Shipment__c = setupSupplyChain.shipment;
      newShipmentEvent.Shipment_Status__c = shipment.status;
      newShipmentEvent.UnitCount__c = shipment.unitCount;
      newShipmentEvent.Type__c = shipment.type;
      newShipmentEvent.OrderId__c = shipment.orderId;
      emit(newShipmentEvent);
        })
        .then(function () { 

    var newShipperEvent = getFactory().newEvent('dapps.salesforce.crm', 'NewShipperEvent');
      newShipperEvent.Name__c = setupSupplyChain.shipper;
      newShipperEvent.Bitcoin_Balance__c = shipper.bitcoinBalance;
      newShipperEvent.Country__c = shipper.country;
      newShipperEvent.Address__c = shipper.address;
      emit(newShipperEvent);
      
        })
        .then(function () { 

    var newSupplierEvent = getFactory().newEvent('dapps.salesforce.crm', 'NewSupplierEvent');
      newSupplierEvent.Name__c = setupSupplyChain.supplier;
      newSupplierEvent.Bitcoin_Balance__c = supplier.bitcoinBalance;
      newSupplierEvent.Country__c = supplier.country;
      newSupplierEvent.Address__c = supplier.address;
      emit(newSupplierEvent);
      
        })
        .then(function () { 

    var newBuyerEvent = getFactory().newEvent('dapps.salesforce.crm', 'NewBuyerEvent');
      newBuyerEvent.Name__c = setupSupplyChain.buyer;
      newBuyerEvent.Bitcoin_Balance__c = buyer.bitcoinBalance;
      newBuyerEvent.Country__c = buyer.country;
      newBuyerEvent.Address__c = buyer.address;
      emit(newBuyerEvent);
});
  
  
}


/**
 * Initialize some test assets and participants useful for running a crm.
 * @param {dapps.salesforce.crm.SetupNewShipment} setupNewShipment - the SetupNewShipment transaction
 * @transaction
 */

function setupNewShipment(setupNewShipment) {

    var factory = getFactory();
    var NS = 'dapps.salesforce.crm';

    // create the contract
    var contract = factory.newResource(NS, 'Contract', 'CONTRACT_300');
  
    contract.supplier = factory.newRelationship(NS, 'Supplier', 'ACME');
    contract.buyer = factory.newRelationship(NS, 'Buyer', 'Walmart');
    contract.shipper = factory.newRelationship(NS, 'Shipper', 'Ryder');
  
    var tomorrow = setupNewShipment.timestamp;
  
    tomorrow.setDate(tomorrow.getDate() + 1);
    contract.status = 'INEFFECT';
    contract.arrivalDateTime = tomorrow; // the shipment has to arrive tomorrow
    contract.unitPrice = 0.5; // pay 50 cents per unit
    contract.minTemperature = 2; // min temperature for the cargo
    contract.maxTemperature = 10; // max temperature for the cargo
    contract.minPenaltyFactor = 0.2; // we reduce the price by 20 cents for every degree below the min temp
    contract.maxPenaltyFactor = 0.1; // we reduce the price by 10 cents for every degree above the max temp

    // create the shipment
    var shipment = factory.newResource(NS, 'Shipment', 'SHIPMENT_300');
    shipment.type = setupNewShipment.type;
    shipment.status = 'CREATED';
    shipment.color = 'CIGAR';
    shipment.unitCount = setupNewShipment.unitCount;
    shipment.orderId = setupNewShipment.orderId;
    shipment.shipper = factory.newRelationship(NS, 'Shipper', 'Ryder');
    shipment.contract = factory.newRelationship(NS, 'Contract', 'CONTRACT_300');
    return getAssetRegistry(NS + '.Contract')
    .then(function(contractRegistry) {
            // add the contracts
            return contractRegistry.addAll([contract]);
        })
    .then(function() {
            return getAssetRegistry(NS + '.Shipment');
        })
    .then(function(shipmentRegistry) {
            // add the shipments
            return shipmentRegistry.addAll([shipment]);
     })
    .then(function () { 

    var newShipmentEvent = getFactory().newEvent('dapps.salesforce.crm', 'NewShipmentEvent');
      newShipmentEvent.Shipment__c = setupNewShipment.shipment;
      newShipmentEvent.Shipment_Status__c = setupNewShipment.status;
      newShipmentEvent.UnitCount__c = setupNewShipment.unitCount;
      newShipmentEvent.Color__c = setupNewShipment.color;
      newShipmentEvent.Type__c = setupNewShipment.type;
      newShipmentEvent.OrderId__c = setupNewShipment.orderId;
      emit(newShipmentEvent);
});
  
}


/**
 * A Checkpoint Transaction for the Shipment
 * @param {dapps.salesforce.crm.Checkpoint} checkPoint - the CheckPoint transaction
 * @transaction
 */

function checkPoint(checkPoint) {

    var shipment = checkPoint.shipment;
    shipment.status = 'INTRANSIT';
    var shipper = checkPoint.shipment.shipper;
   

    if (shipment.checkPoints) {
        shipment.checkPoints.push(checkPoint);
    } else {
        shipment.checkPoints = [checkPoint];
    }

    return getAssetRegistry('dapps.salesforce.crm.Shipment')
        .then(function (shipmentRegistry) {
            // add the checkpoint to the shipment
            return shipmentRegistry.update(shipment);
        })
  .then(function () { 

    var checkPointEvent = getFactory().newEvent('dapps.salesforce.crm', 'CheckpointEvent');
      checkPointEvent.Shipment__c = checkPoint.shipment;
      checkPointEvent.Shipment_Status__c = shipment.status;
      emit(checkPointEvent);
});

  
}


/**
 * Add New Account to the Blockchain
 * @param {dapps.salesforce.crm.addNewAccount}
 * @transaction
 */


function addNewAccount(transaction) {
    var newAccount;
    var factory = getFactory();
    var cId = getRandomId();
    var owner = getCurrentParticipant();

    return getAssetRegistry("dapps.salesforce.crm.Account").then(function(accountRegistry) {
        newAccount = factory.newResource("dapps.salesforce.crm", "Account", cId);
        newAccount.name = transaction.name;
        newAccount.owner = transaction.owner;
        newAccount.type = transaction.type;
        newAccount.phone = transaction.phone;
        newAccount.industry = transaction.industry;

        return accountRegistry.add(newAccount);
    .then(function () { 

    var accountEvent = getFactory().newEvent('dapps.salesforce.crm', 'AccountEvent');
      accountEvent.Name = addNewAccount.name;
      accountEvent.Type = addNewAccount.type;
      accountEvent.Phone = addNewAccount.phone;
      accountEvent.Industry = addNewAccount.industry;
      emit(accountEvent);
});

    }
};


/**
 * Add New Lead to the Blockchain
 * @param {dapps.salesforce.crm.addNewLead}
 * @transaction
 */


function addNewLead(transaction) {
    var newLead;
    var factory = getFactory();
    var cId = getRandomId();
    var owner = getCurrentParticipant();

    return getAssetRegistry("dapps.salesforce.crm.Lead").then(function(leadRegistry) {
        newLead = factory.newResource("dapps.salesforce.crm", "Lead", cId);
        newLead.firstName = transaction.firstName;
        newLead.owner = transaction.owner;
        newLead.lastName = transaction.lastName;
        newLead.phone = transaction.phone;
        newLead.email = transaction.email;

        return leadRegistry.add(newLead);
    .then(function () { 

    var leadEvent = getFactory().newEvent('dapps.salesforce.crm', 'LeadEvent');
      leadEvent.FirstName = addNewLead.firstName;
      leadEvent.LastName = addNewLead.lastName;
      leadEvent.Phone = addNewLead.phone;
      leadEvent.Email = addNewLead.email;

      emit(leadEvent);
});

    }
};


/**
 * Add New Contact to the Blockchain
 * @param {dapps.salesforce.crm.addNewContact}
 * @transaction
 */


function addNewContact(transaction) {
    var newContact;
    var factory = getFactory();
    var cId = getRandomId();
    var owner = getCurrentParticipant();

    return getAssetRegistry("dapps.salesforce.crm.Contact").then(function(accountRegistry) {
        newContact = factory.newResource("dapps.salesforce.crm", "Contact", cId);
        newContact.firstName = transaction.firstName;
        newContact.lastName = transaction.lastName;
        newContact.phone = transaction.phone;
        newContact.email = transaction.email;
        newContact.owner = transaction.owner;

        return contactRegistry.add(newContact);
    .then(function () { 

    var contactEvent = getFactory().newEvent('dapps.salesforce.crm', 'ContactEvent');
      contactEvent.FirstName = addNewContact.contact;
      contactEvent.LastName = addNewContact.lastName;
      contactEvent.Phone = addNewContact.phone;
      contactEvent.Email = addNewContact.email;

      emit(contactEvent);
});

    }
};





/**
 * Add New User to the Blockchain
 * @param {dapps.salesforce.crm.addNewUser}
 * @transaction
 */


function addNewUser(transaction) {
    var newUser;
    var factory = getFactory();
    var cId = getRandomId(); // Get Salesforce User Id
    var owner = getCurrentParticipant();

    return getParticipantRegistry("dapps.salesforce.crm.User").then(function(userRegistry) {
        newUser = factory.newResource("dapps.salesforce.crm", "User", cId);
        newUser.userId = transaction.userId;
        newUser.orgId = transaction.orgId;

        return userRegistry.add(newUser);
    .then(function () { 

    var userEvent = getFactory().newEvent('dapps.salesforce.crm', 'UserEvent');
      userEvent.userId = addNewUser.user;
      userEvent.orgId = addNewUser.org;
      emit(userEvent);
});

    }
};




/**
 * Issue Identity Function
 * @param {dapps.salesforce.crm.issueIdentity}
 * @transaction 
 */


function issueIdentity(transaction) {
    var user;
    var owner = getCurrentParticipant();


    return await
    businessNetworkConnection.issueIdentity('dapps.salesforce.crm.User' + '#' + 'participant.UserId, UserId');


    return userRegistry.update();

    })

}







/**
 * Issue Identity Function
 * @param {dapps.salesforce.crm.bindIdentity}
 * @transaction 
 */

function bindIdentity(transaction) {
    var user;
    var owner = getCurrentParticipant();
    var certificate;

    return getParticipantRegistry("dapps.salesforce.crm.User").then(function(userRegistry) {
        
    return await
    businessNetworkConnection.bindIdentity('dapps.salesforce.crm.User' + '#' + 'participant.UserId', certificate);

    }

    return userRegisty.update();

})

}

// Card 


const metadata = {
   userName: userID,
   version: hlfVersion,
   enrollmentSecret: enrollSecret,
   businessNetwork: networkName
};
const idCardData = new IdCard(metadata, connectionProfile);
const idCardName = BusinessNetworkCardStore.getDefaultCardName(idCardData);
try{
    const imported = await adminConnection.importCard(idCardName, idCardData);
} catch(error){
    throw error;
}
};