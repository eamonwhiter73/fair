<?php
	header('Content-Type: application/json');

	$id = $_GET['id'];
	//error_log($id, 3, "error_log");

	$header = array();
	$header[] = 'Authorization: Bearer sq0atp-on5KcHDr0dhlbefU0EwVwg';
	$header[] = 'Content-Type: application/json';
	$header[] = 'Accept: application/json';

	$ch = curl_init("https://connect.squareup.com/v2/locations/JN6S37JH6M1Z2/transactions/".$id); // such as http://example.com/example.xml
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $header);

	$data = curl_exec($ch);
	curl_close($ch);

	//error_log($data);

	$array = json_decode($data, true);
	$timestamp = $array['transaction']['created_at'];
	$location_id = $array['transaction']['location_id'];

	$date = new DateTime($timestamp);
	$date->add(new DateInterval("PT1S"));

	//error_log($timestamp);
	//error_log($location_id);

	$ch1 = curl_init("https://connect.squareup.com/v1/".$location_id."/payments?begin_time=".rawurlencode($timestamp)."&end_time=".rawurlencode($date->format(DateTime::ATOM)));

	curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($ch1, CURLOPT_HEADER, 0);
	curl_setopt($ch1, CURLOPT_HTTPHEADER, $header);

	$data1 = curl_exec($ch1);
	curl_close($ch1);

	//error_log($data1);

	/*THIS NEEDS TO WORK WHEN MULTIPLE SALES HAPPEN IN THE SAME SECOND - PARSE THROUGH AND CHECK ALL PAYMENT TENDER IDS AGAINST TRANSACTION TENDER IDS*/
	
	$array1 = json_decode($data1, true);
	$transactionTenderId = $array['transaction']['tenders'][0]['id'];
	$transactionTenderLocationId = $array['transaction']['tenders'][0]['location_id'];
	$paymentTenderId = $array1[0]['id'];
	$pieces = explode("/", $array1[0]['itemizations'][0]['notes']);
	$sku = $pieces[0];
	$email = $pieces[1];

	if($transactionTenderId == $paymentTenderId) {

		//$tmp = exec("python updatequantity.py $sku");
		//error_log($tmp);

		/*$ch2 = curl_init("https://fairstarter.eamondev.com/updatequantity.html?sku=".$sku); // such as http://example.com/example.xml
		curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch2, CURLOPT_HEADER, 0);

		$data2 = curl_exec($ch2);
		curl_close($ch2);

		error_log($data2);*/

		//
		// A very simple PHP example that sends a HTTP POST to a remote site
		//
		$exact = [
			'attribute_name' => 'sku',
			'attribute_value' => $sku
		];

		$query = [
			'exact_query' => $exact
		];

		$data = array('object_types'=>['ITEM','ITEM_VARIATION'], 'query'=> $query);

		$params = json_encode($data);

		$ch2 = curl_init();

		curl_setopt($ch2, CURLOPT_URL,"https://connect.squareup.com/v2/catalog/search");
		curl_setopt($ch2, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch2, CURLOPT_POSTFIELDS, $params);
		curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch2, CURLOPT_HTTPHEADER, $header);

		// In real life you should use something like:
		// curl_setopt($ch, CURLOPT_POSTFIELDS, 
		//          http_build_query(array('postvar1' => 'value1')));

		// Receive server response ...

		$server_output = curl_exec($ch2);

		curl_close ($ch2);

		// Further processing ...
		//error_log($server_output);

		$array2 = json_decode($server_output, true);

		$variation_id = $array2['objects'][0]['id'];
		$params1 = [
			'quantity_delta' => -1,
			'attribute_value' => $sku,
			'adjustment_type' => 'SALE'
		];

		$ch3 = curl_init();

		curl_setopt($ch3, CURLOPT_URL,"https://connect.squareup.com/v1/".$transactionTenderLocationId."/inventory/".$variation_id);
		curl_setopt($ch3, CURLOPT_CUSTOMREQUEST, "POST");
		curl_setopt($ch3, CURLOPT_POSTFIELDS, json_encode($params1));
		curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch3, CURLOPT_HTTPHEADER, $header);

		// In real life you should use something like:
		// curl_setopt($ch, CURLOPT_POSTFIELDS, 
		//          http_build_query(array('postvar1' => 'value1')));

		// Receive server response ...

		$server_output2 = curl_exec($ch3);

		curl_close ($ch3);

		$arr = array();
		$arr['data'] = $sku;
		$arr['email'] = $email;

		echo json_encode($arr);
	}
?>