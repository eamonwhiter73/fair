$(document).ready(function() {
    //If successful, Square Point of Sale returns the following parameters.
	const clientTransactionId = "client_transaction_id";
	const transactionId = "transaction_id";

	//If there's an error, Square Point of Sale returns the following parameters.
	const errorField = "error_code";

	var config = {
	        apiKey: "AIzaSyB48MIAoHmA1ZhKwN9LV54EG-CoUEykFhc",
	        authDomain: "fairstarterprototype.firebaseapp.com",
	        databaseURL: "https://fairstarterprototype.firebaseio.com",
	        projectId: "fairstarterprototype",
	        storageBucket: "fairstarterprototype.appspot.com",
	        messagingSenderId: "736108062496"
	    };

	firebase.initializeApp(config);

	var db = firebase.firestore();

	printResponse();

	//get the data URL and encode in JSON
	function getTransactionInfo(URL) {
		var params = new URLSearchParams(document.location.search.substring(1));
		var data = decodeURI(params.get("data")); // is the string "Jonathan"

		//alert("data: " + data);
		var transactionInfo = JSON.parse(data);
		return transactionInfo;
	}

	// Makes a result string for success situation
	function handleSuccess(transactionInfo){
	  var resultString ="";

	  if (clientTransactionId in transactionInfo) {
	    resultString += "Client Transaction ID: " + transactionInfo[clientTransactionId] + "<br>";
	  }

	  if (transactionId in transactionInfo) {
	  	//alert(transactionInfo[transactionId]);
	    
	    //resultString += "Transaction Info: " + transactionInfo[transactionId] + "<br>";

	    //DO THIS FROM SERVER, MAKE CALL FROM HERE TO SERVER
	    var params = {id:transactionInfo[transactionId]};

	    var url = new URL("https://fairstarter.eamondev.com/transactionlookup.php");

		url.search = new URLSearchParams(params);

		fetch(url, {
			method: 'GET',
			headers: {
			    Accept: 'application/json',
			}
		}).then(response => {

		  if (response.ok) {
		    response.json().then(json => {

		    	if(json.data == "Manual sale") {
		    		alert("Manual sale complete! Return to Fairstarter!");
		    		return;
		    	}

		    	var quant = 0;
		    	var itemsRef = db.collection('items');
				var query = itemsRef.where('barcode', '==', String(json.data)).get()
				    .then(snapshot => {

				      snapshot.forEach(doc => {
				      	
				        quant = Number(doc.data()[Object.keys(doc.data())[0]].quantity);
				        
				        var newVal = Number(quant) - 1;
				    	
				    	itemsRef.doc(doc.id).update({
				    		[Object.keys(doc.data())[0]]]: {
						    	quantity: newVal
						    }
						})
						.then(function() {
						    alert("Quantity successfully updated! Please return to Fairstarter!");
						})
						.catch(function(error) {
						    alert("Error writing document: ", error);
						});
				      })
				    })
				    .catch(err => {
				      alert('Error getting documents ' + JSON.stringify(err));
				    });
		    })
		  }
		  else {
		  	alert("Response is not ok.");
		  }
		})
		.catch(error=> {
			alert("Error: " + error);
		});

	  }
	  else {
	    resultString += "Transaction ID: NO CARD USED<br>";
	  }
	  return resultString;
	}


	// Makes an error string for error situation
	function handleError(transactionInfo){
	  var resultString ="";

	  if (errorField in transactionInfo) {
	    resultString += "Error: " + JSON.stringify(transactionInfo[errorField])+ "<br>";
	    if(transactionInfo[errorField] == "not_logged_in") {
	    	alert("Please open the Square POS app and login, and then return to Fairstarter and redo the transaction.");
	    }
	    else if(transactionInfo[errorField] == "payment_canceled") {
	    	alert("Transaction cancelled. Please return to Fairstarter to initiate another transaction.");
	    }
	  }
	  if (transactionId in transactionInfo) {
	    resultString += "Transaction ID: " + transactionInfo[transactionId] + "<br>";
	  }
	   else {
	    resultString += "Transaction ID: PROCESSED OFFLINE OR NO CARD USED<br>";
	  }
	  return resultString;
	}

	// Determines whether error or success based on urlParams, then prints the string
	function printResponse() {
	  var responseUrl = window.location.href;
	  var transactionInfo = getTransactionInfo(responseUrl);
	  var resultString = "IN PRINT RESPONSE";

	  if (errorField in transactionInfo) {
	    resultString = handleError(transactionInfo);
	  } else {
	    resultString = handleSuccess(transactionInfo);
	  }

	  document.getElementById('url').innerHTML = resultString;
	}
});