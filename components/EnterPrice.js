import React from 'react';
import { StyleSheet, Text, TextInput, View, Button, Linking, Platform, Alert } from 'react-native';
import firebase from 'react-native-firebase';

export default class EnterPrice extends React.Component {

  static navigationOptions = {
    headerTitle: 'Enter Price',
    headerTitleStyle: {textAlign: 'center', flex: 1, backgroundColor: '#ddeaff', color: '#518dff', fontFamily: 'American Typewriter', fontWeight: 'bold', fontSize: 20},
    headerStyle: {backgroundColor: '#ddeaff'}
  };

  state = {
    text: "",
  };

  constructor() {
    super();
    this.authSubscription = null;
  }

  submitEdit = () => {
    if(this.state.text == null || isNaN(parseInt(this.state.text))) {
      Alert.alert("Please enter a price.");
    }
    else {
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
          urlL = "square-commerce-v1://payment/"+Number(this.state.text)*100+"/manual_sale/"+this.state.user.email;
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
  }

  componentWillMount() {
    this.authSubscription = firebase.auth().onAuthStateChanged((user) => {

      if(user) {
        this.setState({
          loading: false,
          user,
        });
      }
    });
  }

  componentWillUnmount() {
    this.authSubscription();
  }

  render() {
    return (
      <View style={{paddingHorizontal: 15, flex: 1, backgroundColor: '#ddeaff', alignItems: 'center'}}>
        <Text style={{marginTop: 25, fontFamily: 'American Typewriter', fontWeight: 'bold', color: '#518dff', marginTop: 50}}>Price ($): </Text>
        <TextInput
          style={{width: 240, height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 15, backgroundColor: '#ffffff', borderRadius: 4, paddingLeft: 5}}
          onChangeText={(text) => this.setState({text: text})}
          value={this.state.text}
          onSubmitEditing={this.submitEdit}
        />
      </View>
    );
  }
}