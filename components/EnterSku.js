import React from 'react';
import { StyleSheet, Text, TextInput, View, Button, Linking, Platform, Alert } from 'react-native';
import firebase from 'react-native-firebase';

export default class EnterSku extends React.Component {

  static navigationOptions = {
    title: 'Enter SKU',
    headerTitleStyle: {textAlign: 'center', flex: 1},
  };

  state = {
    text: "",
  };

  submitEdit = () => {
    if(this.state.text != null) {
      const { navigate } = this.props.navigation;
      self = this;

      if(this.props.navigation.state.params.mode == 'sell') {

        firebase.firestore().collection("items").where("barcode", "==", this.state.text)
          .get()
          .then(function(querySnapshot) {
              querySnapshot.forEach(function(doc) {
                  // doc.data() is never undefined for query doc snapshots
                  price = doc.data().price;

                  dataParameter = {
                    amount_money: {
                      amount:        Number(price) * 100,
                      currency_code: "USD",
                    },

                    // Replace this value with your application's callback URL
                    callback_url: "https://fairstarter.eamondev.com/callback.html",

                    // Replace this value with your application's ID
                    client_id: "sq0idp-vHgDfd4SSLvkgAqfjZpwEg",

                    version: "1.3",
                    notes: doc.data().barcode,
                    options: {
                      supported_tender_types: ["CREDIT_CARD","CASH","OTHER","SQUARE_GIFT_CARD","CARD_ON_FILE"],
                    }
                  };
                  
                  var urlL = "";
                  
                  if(Platform.OS === 'ios') {
                    urlL = "square-commerce-v1://payment/create?data=" + encodeURIComponent(JSON.stringify(dataParameter));
                  }
                  else {
                    urlL = "square-commerce-v1://payment/"+Number(price)*100+"/"+self.state.text;
                  }

                  Linking.openURL(urlL).then(() => {
                    navigate('Inventory');
                  }).catch(err => console.log('There was an error:' + err));
              });
          })
          .catch(function(error) {
              console.log("Error getting documents: ", error);
          });
      }
      else {
        navigate('EnterPrice', { onNavigateBack: this.props.navigation.state.params.onNavigateBack, forFromPrice: this.props.navigation.state.params.forFromPrice, sku: this.state.text, mode: "fromEnterSku" });
      }
    }
    else {
      Alert.alert("Please enter a SKU.");
    }
  }

  render() {
    return (
      <View style={{flexDirection: 'row', paddingHorizontal: 15}}>
        <Text style={{marginTop: 25}}>SKU: </Text>
        <TextInput
          style={{height: 40, borderColor: 'gray', borderWidth: 1, flex: 1, marginTop: 15, backgroundColor: '#ffffff'}}
          onChangeText={(text) => this.setState({text})}
          value={this.state.text}
          onSubmitEditing={this.submitEdit}
        />
      </View>
    );
  }
}