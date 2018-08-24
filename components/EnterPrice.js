import React from 'react';
import { StyleSheet, Text, TextInput, View, Button, Linking, Platform, Alert } from 'react-native';

export default class EnterPrice extends React.Component {

  static navigationOptions = {
    headerTitle: 'Enter Price',
    headerTitleStyle: {textAlign: 'center', flex: 1, backgroundColor: '#ddeaff', color: '#518dff', fontFamily: 'American Typewriter', fontWeight: 'bold', fontSize: 20},
    headerStyle: {backgroundColor: '#ddeaff'}
  };

  state = {
    text: "",
  };

  submitEdit = () => {
    if(this.state.text != null) {
      const { navigate } = this.props.navigation;
      
      if(this.props.navigation.state.params.mode == "fromEnterSku") {
        this.props.navigation.state.params.onNavigateBack(this.props.navigation.state.params.sku);
        this.props.navigation.state.params.forFromPrice(this.state.text);
      }
      else if(this.props.navigation.state.params.mode == "manual") {
        dataParameter = {
          amount_money: {
            amount: Number(this.state.text) * 100,
            currency_code: "USD",
          },

          // Replace this value with your application's callback URL
          callback_url: "https://fairstarter.eamondev.com/callback.html",

          // Replace this value with your application's ID
          client_id: "sq0idp-vHgDfd4SSLvkgAqfjZpwEg",

          version: "1.3",
          notes: "Manual sale",
          options: {
            supported_tender_types: ["CREDIT_CARD","CASH","OTHER","SQUARE_GIFT_CARD","CARD_ON_FILE"],
          }
        };

        var urlL = "";
                  
        if(Platform.OS === 'ios') {
          urlL = "square-commerce-v1://payment/create?data=" + encodeURIComponent(JSON.stringify(dataParameter));
        }
        else {
          urlL = "square-commerce-v1://payment/"+Number(this.state.text)*100+"/manual_sale";
        }

        Linking.openURL(urlL).then(() => {
          navigate('Inventory');
        }).catch(err => console.log('There was an error:' + err));
      }
      else {
        this.props.navigation.state.params.onNavigateBack(`${this.props.navigation.state.params.data}`);
        this.props.navigation.state.params.forFromPrice(this.state.text);
      }
      
      navigate('Inventory', { mode: "fromPrice" });
    }
    else {
      Alert.alert("Please enter a price.");
    }
  }

  render() {
    return (
      <View style={{flexDirection: 'row', paddingHorizontal: 15}}>
        <Text style={{marginTop: 25}}>Price: </Text>
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