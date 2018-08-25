package com.fairstarter.fairstarterprototype;

import com.facebook.react.ReactActivity;
import com.squareup.sdk.pos.PosSdk;
import com.squareup.sdk.pos.PosClient;
import com.squareup.sdk.pos.ChargeRequest;
import com.squareup.sdk.pos.CurrencyCode;

import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.util.Log;
import android.app.AlertDialog;
import android.content.ActivityNotFoundException;
import android.app.Activity;
import android.content.Context;
import android.content.ContextWrapper;

import android.app.AlertDialog;
import android.app.Dialog;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.support.v4.app.DialogFragment;
import java.net.URLConnection;
import java.net.URL;
import java.io.InputStream;
import com.google.firebase.firestore.*;
import com.google.android.gms.tasks.*;
import android.support.annotation.NonNull;
import java.util.Map;
import android.view.View.OnClickListener;
import android.content.DialogInterface;
import java.util.Objects;


public class MainActivity extends ReactActivity {

    private static final String APPLICATION_ID = "sq0idp-vHgDfd4SSLvkgAqfjZpwEg";
    private static final int CHARGE_REQUEST_CODE = 1;
    private PosClient posClient;
    private String sku;
    private String email;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        //setContentView(R.layout.main);

        Intent intent = getIntent();
        String action = intent.getAction();
        Uri data = intent.getData();

        Log.d("*******Intent*****", intent.toString());

        if(data != null) {
            String[] arr = data.toString().split("payment/");
	        Log.d("********MainActivity(*******", arr[arr.length - 1].toString());
	        String[] array = arr[arr.length - 1].toString().split("/");
	        String price = array[0];
	        sku = array[1];
	        email = array[2];
	       	Log.d("********price(*******", price);
	        Log.d("********sku(*******", sku);

	        startTransaction(price);
	    }
    }

    public Activity getActivity(Context context)
    {
      if (context == null)
      {
        return null;
      }
      else if (context instanceof ContextWrapper)
      {
        if (context instanceof Activity)
        {
          return (Activity) context;
        }
        else
        {
          return getActivity(((ContextWrapper) context).getBaseContext());
        }
      }

      return null;
    }

    public void startTransaction(String price) {
      posClient = PosSdk.createClient(this, APPLICATION_ID);

      ChargeRequest request = new ChargeRequest.Builder(
      Integer.parseInt(price),
      CurrencyCode.USD)
      .build();
      try {
        Log.d("*(*(*(*(*(*(*(*(*", "in the try block for startTransaction");
        Intent intent = posClient.createChargeIntent(request);
        startActivityForResult(intent, CHARGE_REQUEST_CODE);

      } catch (ActivityNotFoundException e) {
        AlertDialogHelper.showDialog(this,
	            "Error",
	            "Square Point of Sale app is not installed.");
        posClient.openPointOfSalePlayStoreListing();
      }
    }

    static String convertStreamToString(java.io.InputStream is) {
	    java.util.Scanner s = new java.util.Scanner(is).useDelimiter("\\A");
	    return s.hasNext() ? s.next() : "";
	}

    @Override public void onActivityResult(int requestCode, int resultCode, Intent data) {
    	Log.d("************(MANUALSALESKU)************", sku);

    	if(Objects.equals("manual_sale", new String(sku))) {
			Log.d("************(MANUALSALE)************", "MANUALSALE complete!");
    		// Handle expected errors
	       	AlertDialog alert = new AlertDialog.Builder(MainActivity.this).create();
			alert.setTitle("Success");
			alert.setMessage("Sale complete!");
			alert.setButton(AlertDialog.BUTTON_NEUTRAL, "OK",
			    new DialogInterface.OnClickListener() {
			        public void onClick(DialogInterface dialog, int which) {
			            dialog.dismiss();
			        }
			    });
			alert.show();

			return;
    	}

	    // Handle unexpected errors
	    if (data == null || requestCode != CHARGE_REQUEST_CODE) {
	        AlertDialogHelper.showDialog(this,
	            "Error: unknown",
	            "Square Point of Sale was uninstalled or stopped working");
	      return;
	    }

	    // Handle expected results
	    if (resultCode == Activity.RESULT_OK) {
	      // Handle success
			//url.search = new URLSearchParams(params);

			try {

		    	FirebaseFirestore db = FirebaseFirestore.getInstance();

		    	Object quant = new Object();
		    	db.collection("items").document(email).collection("userItems")
			        .whereEqualTo("barcode", sku)
			        .get()
			        .addOnCompleteListener(new OnCompleteListener<QuerySnapshot>() {
			            @Override
			            public void onComplete(@NonNull Task<QuerySnapshot> task) {
			                if (task.isSuccessful()) {
			                    for (QueryDocumentSnapshot document : task.getResult()) {
			                        Log.d("DOCDOCDOC ((()))(((()))(((()))((()))", document.getId() + " => " + document.getData());

			                        Map data = document.getData();
			                        //quant = data.get("quantity");
				        			
				        			Log.d("quantquant ((()))(((()))(((()))((()))", data.get("quantity").toString());

							        Number newVal = Integer.parseInt(data.get("quantity").toString()) - 1;

							        DocumentReference doc = db.collection("items").document(email).collection("userItems").document(document.getId());

									// Set the "isCapital" field of the city 'DC'
									doc
								        .update("quantity", newVal)
								        .addOnSuccessListener(new OnSuccessListener<Void>() {
								            @Override
								            public void onSuccess(Void aVoid) {
								                Log.d("DocumentSnapshot((((**(*((**((*(**(", "DocumentSnapshot successfully updated!");
								                AlertDialog alertDialog = new AlertDialog.Builder(MainActivity.this).create();
												alertDialog.setTitle("Success");
												alertDialog.setMessage("Sale complete!");
												alertDialog.setButton(AlertDialog.BUTTON_NEUTRAL, "OK",
												    new DialogInterface.OnClickListener() {
												        public void onClick(DialogInterface dialog, int which) {
												            dialog.dismiss();
												        }
												    });
												alertDialog.show();
								            }
								        })
								        .addOnFailureListener(new OnFailureListener() {
								            @Override
								            public void onFailure(@NonNull Exception e) {
								            	AlertDialog alertDialog = new AlertDialog.Builder(MainActivity.this).create();
												alertDialog.setTitle("Error");
												alertDialog.setMessage("Sale complete, but quantity may have not been updated.");
												alertDialog.setButton(AlertDialog.BUTTON_NEUTRAL, "OK",
												    new DialogInterface.OnClickListener() {
												        public void onClick(DialogInterface dialog, int which) {
												            dialog.dismiss();
												        }
												    });
												alertDialog.show();
								            }
								        });

			                    }
			                } else {
			                    Log.d("ERRORERROR &&&*****&&&&*****&&&&*****", "Error getting documents: ", task.getException());
			                }
			            }
			        });

            } catch (Exception e) {

                Log.d("trycatchtrycatchmainactivitysuccess *****************", e.toString());

            }
	    } else {
	        // Handle expected errors
	        ChargeRequest.Error error = posClient.parseChargeError(data);
	        AlertDialogHelper.showDialog(this,
	            "Error" + error.code,
	            error.debugDescription
	        );
	    }
	    return;
	}

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "fairstarterprototype";
    }
}

class AlertDialogHelper extends DialogFragment {

  private static AlertDialog mAlertDialog;

  @Override
  public Dialog onCreateDialog(Bundle savedInstanceState) {
    super.onCreateDialog(savedInstanceState);
    return null;
  }

  private static Dialog getDialog(Activity activity,
    String title, String description, int resourceId) {
    if (mAlertDialog == null) {
      mAlertDialog =  new AlertDialog.Builder(activity, resourceId)
          .setTitle(title + ": " + description)
          .setPositiveButton("OK", null)
          .create();
    } else {
      mAlertDialog.setTitle(title + ":" + description);
      mAlertDialog.setOwnerActivity(activity);
    }
    return mAlertDialog;
  }

  public static void showDialog(Activity activity, String title,
     String description) {
    int resourceId = 0;
    try {
      resourceId =
          activity
              .getPackageManager()
              .getActivityInfo(activity.getComponentName()
                  , 0)
              .getThemeResource();
    } catch (PackageManager.NameNotFoundException e) {
      e.printStackTrace();
    } finally {
      getDialog(
          activity,
          title,
          description,
          resourceId).show();
    }
  }
}
