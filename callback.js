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

	var resultString = "";

	firebase.initializeApp(config);

	firebase.auth().onAuthStateChanged(function(user) {
	  if (user) {
	    // User is signed in.
	    var isAnonymous = user.isAnonymous;
	    //alert(user.uid);
	    // ...
	  } else {
	    // User is signed out.
	    // ...
	  }
	  // ...
	});
	
	firebase.auth().signInAnonymously().catch(function(error) {
  		  // Handle Errors here.
		  var errorCode = error.code;
		  var errorMessage = error.message;
		  // ...
		  alert(errorMessage);
	});

	var firestoreSettings = { timestampsInSnapshots: true };

	var db = firebase.firestore();

	db.settings(firestoreSettings);

	printResponse();

	//get the data URL and encode in JSON
	function getTransactionInfo(URL) {
		var params = new URLSearchParams(document.location.search.substring(1));
		var data = decodeURI(params.get("data")); // is the string "Jonathan"

		//alert("data: " + data);
		var transactionInfo = JSON.parse(data);
		return transactionInfo;
	}

	function getCircularReplacer() {
	  const seen = new WeakSet();
	  return (key, value) => {
	    if (typeof value === "object" && value !== null) {
	      if (seen.has(value)) {
	        return;
	      }
	      seen.add(value);
	    }
	    return value;
	  };
	};

	// Makes a result string for success situation
	function handleSuccess(transactionInfo){
	  resultString+="";
	  
	  if (clientTransactionId in transactionInfo) {
	    resultString += "Client Transaction ID: " + transactionInfo[clientTransactionId] + "<br>";
	  }

	  if (transactionId in transactionInfo) {
	  	//alert(JSON.stringify(transactionInfo));
	    
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

		    		$(".loader_container").hide();
		    		window.location.href = './complete.html';
		    		return;
		    	}

		    	//alert(json.email);

		    	var quant = 0;
		    	var itemsRef = db.collection('items').doc(json.email).collection('userItems');
				var query = itemsRef.where('barcode', '==', json.data).get()
				    .then(snapshot => {
				      //alert("Entered snapshot block");

				      snapshot.forEach(doc => {
				        quant = Number(doc.data().quantity);
				        
				        var newVal = Number(quant) - 1;
				    	
				    	itemsRef.doc(doc.id).update({
						    quantity: newVal
						})
						.then(function() {
							$(".loader_container").hide();
						    alert("Quantity successfully updated! Please return to Fairstarter!");
						    window.location.href = './complete.html';
						})
						.catch(function(error) {
						    alert("Error writing document: ", error);
						});
				      })
				    })
				    .catch(err => {
				      alert('Error getting documents ' + JSON.stringify(err));
				    });

		    }).catch(err => {
		    	alert(err.message);
		    })
		  }
		  else {
		  	alert("Response is not ok.");
		  	resultString += "Response is not ok";
		  }
		})
		.catch(error=> {
			alert("Error: " + error.message);
			resultString += "Error: " + error.message;
		});

	  }
	  else {
	    resultString += "Transaction ID: NO CARD USED<br>";
	  }
	  return resultString;
	}


	// Makes an error string for error situation
	function handleError(transactionInfo){

	  if (errorField in transactionInfo) {
	    resultString += "Error: " + JSON.stringify(transactionInfo[errorField])+ "<br>";

	    if(transactionInfo[errorField] == "not_logged_in") {
	    	$(".loader_container").hide();
	    	alert("Please open the Square POS app and login, and then return to Fairstarter and redo the transaction.");
	    }
	    else if(transactionInfo[errorField] == "payment_canceled") {
	    	$(".loader_container").hide();
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
	  var resultStringInside = "";
	  var responseUrl = window.location.href;
	  var transactionInfo = getTransactionInfo(responseUrl);

	  if (errorField in transactionInfo) {
	    resultStringInside = handleError(transactionInfo);
	  } else {
	    resultStringInside = handleSuccess(transactionInfo);
	  }

	  document.getElementById('url').innerHTML = resultStringInside;
	}
});