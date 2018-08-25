const functions = require('firebase-functions');
const SquareConnect = require('square-connect');
const defaultClient = SquareConnect.ApiClient.instance;
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);

var db = admin.firestore();

var api = new SquareConnect.CatalogApi();
var locationApi = new SquareConnect.LocationsApi();
var inventoryApi = new SquareConnect.V1ItemsApi();

oauth2 = defaultClient.authentications.oauth2;
oauth2.accessToken = 'sq0atp-on5KcHDr0dhlbefU0EwVwg';

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.addItem = functions.firestore
    .document('items/{email}/userItems/{itemId}')
    .onCreate((snap, context) => {
		// Get an object representing the document
		// e.g. {'name': 'Marie', 'age': 66}
		const newValue = snap.data();
		console.log(newValue);

		var variation = {
		    "type": "ITEM_VARIATION",
		    "id": "#"+newValue.barcode+"variation",
		    "present_at_all_locations": true,
		    "item_variation_data": {
		      "item_id": "#"+newValue.barcode,
		      "name": "Regular",
		      "pricing_type": "FIXED_PRICING",
		      "price_money": {
		        "amount": Number(newValue.price) * 100,
		        "currency": "USD",
		      },
		      "sku": newValue.barcode,
		      "track_inventory": true
		    }
		};

		// Create a new item or reconfigure an existing item
		var item = {
		  type: 'ITEM',
		  id: '#' + newValue.barcode,
		  item_data: {
		    name: newValue.barcode,
		    description: newValue.description,
		    variations: [variation]
		  }
		};

		// Initialize request body.
		// Set a unique idempotency key for each request.
		const idempotencyKey = require('crypto').randomBytes(32).toString('hex');
		console.log(idempotencyKey);
		
		var body = {
		  idempotency_key: idempotencyKey,
		  batches: [{
		  	objects: [item]
		  }]
		};

		// Upsert the catalog item
		api.batchUpsertCatalogObjects(body)
		  .then((response) => {
		  	console.log("First response: " + JSON.stringify(response));
		  	var res = response;
		  	var variationId = res.objects[0].item_data.variations[0].id;

		    locationApi.listLocations().then(function(data) {
			  console.log('API called successfully in locationApi. Returned data: ' + JSON.stringify(data));

			  	var dat = data;
			    var locationId = dat.locations[0].id; // String | The ID of the item's associated location.

				var adjustBody = {
					quantity_delta: Number(newValue.quantity),
					adjustment_type: 'RECEIVE_STOCK'
				}

				inventoryApi.adjustInventory(locationId, variationId, adjustBody).then(function(data) {
				  console.log('API called successfully in inventoryApi. Returned data: ' + JSON.stringify(data));
				}, function(error) {
				  console.log(error.message);
				});
			}, function(error) {
			  console.log(error.message);
			});
		  });
		return null;
    });

exports.updateItem = functions.firestore
    .document('items/{email}/userItems/{itemId}')
    .onUpdate((change, context) => {
        // Get an object representing the document
        // e.g. {'name': 'Marie', 'age': 66}
        const newValue = change.after.data();
        const previousValue = change.before.data();

        var params = {
        	query: {
        		exact_query: {
        			attribute_name: "sku",
        			attribute_value: newValue.barcode
        		}
        	}
        }

        api.searchCatalogObjects(params).then(function(data) {
		    console.log('API called successfully in searchFor IDS. Returned data: ' + JSON.stringify(data));

		    var dat = data;

		    console.log("Version: " + dat.objects[0].version);

		    var variationObj = dat.objects[0];

		    variationObj.item_variation_data.price_money =  {amount: Number(newValue.price) * 100, currency: 'USD'};
			
			const idempotencyKey = require('crypto').randomBytes(32).toString('hex');
	      	var body = {
			  idempotency_key: idempotencyKey,
			  object: variationObj
			};


	      	api.upsertCatalogObject(body).then(function(dataUpsert) {
			    console.log('API called successfully in update from EditItem. Returned data: ' + JSON.stringify(dataUpsert));

			    if(newValue.quantity != previousValue.quantity) {
			  	
				  	var res = dataUpsert;
				  	var variationId = res.catalog_object.id;

				    locationApi.listLocations().then(function(dataLocation) {
					  console.log('API called successfully in locationApi. Returned data: ' + JSON.stringify(dataLocation));

					  	var dat1 = dataLocation;
					    var locationId = dat1.locations[0].id;
					    console.log("Location ID: " + JSON.stringify(locationId));
						 // String | The ID of the variation to adjust inventory information for.

						//var body = new SquareConnect.V1AdjustInventoryRequest(); // V1AdjustInventoryRequest | An object containing the fields to POST for the request.  See the corresponding object definition for field details.
						var delta = 0;
						if(Number(newValue.quantity) > Number(previousValue.quantity)) {
							delta = Number(newValue.quantity) - Number(previousValue.quantity);
						}
						else if(Number(newValue.quantity) < Number(previousValue.quantity)) {
							delta = -1*(Number(previousValue.quantity) - Number(newValue.quantity));
						}
						else {
							delta = 0;
						}

						var adjustBody = {
							quantity_delta: delta,
							adjustment_type: 'MANUAL_ADJUST'
						}

						inventoryApi.adjustInventory(locationId, variationId, adjustBody).then(function(dataInvent) {
						    console.log('API called successfully in inventoryApi. Returned data: ' + JSON.stringify(dataInvent));

						    if(newValue.description != previousValue.description) {

						    	var params1 = {
						        	query: {
						        		exact_query: {
						        			attribute_name: "name",
						        			attribute_value: previousValue.barcode
						        		}
						        	}
						        }
						    	
						    	api.searchCatalogObjects(params1).then(function(dataSearch) {
								    console.log('API called successfully in searchFor IDS. Returned data: ' + JSON.stringify(dataSearch));

								    var dat2 = dataSearch;

								    console.log("ITEM ITEM: " + dat2.objects[0]);

								    var itemObj = dat2.objects[0];

								    itemObj.item_data.name = newValue.barcode;
								    itemObj.item_data.description = newValue.description;
									
									const idempotencyKey1 = require('crypto').randomBytes(32).toString('hex');
							      	var body1 = {
									  idempotency_key: idempotencyKey1,
									  object: itemObj
									};

									api.upsertCatalogObject(body1).then(function(dataUpsert2) {
								    	console.log('API called successfully in update from upsertDescriptionOfItem. Returned data: ' + JSON.stringify(dataUpsert2));
									}, function(error) {
									  console.log(error.message);
									});
								});
							}
						}, function(error) {
						  console.log(error.message);
						});
					}, function(error) {
					  console.log(error.message);
					});
				}
			}, function(error) {
			  console.log(error.message);
			});
		    
		}, function(error) {
		  console.log(error.message);
		});

      return null;
    });

exports.deleteItem = functions.firestore
    .document('items/{email}/userItems/{itemId}')
    .onDelete((snap, context) => {
      // Get an object representing the document prior to deletion
      // e.g. {'name': 'Marie', 'age': 66}
      const deletedValue = snap.data();

      var params1 = {
        query: {
          exact_query: {
            attribute_name: "sku",
            attribute_value: deletedValue.barcode
          }
        }
      }
                  
      api.searchCatalogObjects(params1).then(function(dataSearch) {
        console.log('API called successfully in searchFor IDS. Returned data: ' + JSON.stringify(dataSearch));

        var dat = dataSearch;

        console.log("Version: " + dat.objects[0].version);

        var variationObj = dat.objects[0];

        var objectId = variationObj.id; // String | The ID of the [CatalogObject](#type-catalogobject) to be deleted. When an object is deleted, other objects in the graph that depend on that object will be deleted as well (for example, deleting a [CatalogItem](#type-catalogitem) will delete its [CatalogItemVariation](#type-catalogitemvariation)s).

        api.deleteCatalogObject(objectId).then(function(data) {
          console.log('Delete API called successfully on Variation. Returned data: ' + data);
          api.deleteCatalogObject(variationObj.item_variation_data.item_id).then(function(data) {
            console.log('Delete API called successfully on Item. Returned data: ' + data);
          }, function(error) {
            console.log(error.message);
          });
        }, function(error) {
          console.log(error.message);
        });
      });

      // perform desired operations ...
      return null;
    });
