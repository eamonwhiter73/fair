import React from 'react';
import { RNCamera } from 'react-native-camera';
import { StyleSheet, Text, View, Alert, Permissions, Linking, TouchableOpacity, Platform } from 'react-native';
import firebase from 'react-native-firebase';
import DeepLinking from 'react-native-deep-linking';

export default class BarcodeScanner extends React.Component {

  static navigationOptions = {
    headerTitle: 'Scan Item',
    headerTitleStyle: {textAlign: 'center', flex: 1, backgroundColor: '#ddeaff', color: '#518dff', fontFamily: 'American Typewriter', fontWeight: 'bold', fontSize: 20},
    headerStyle: {backgroundColor: '#ddeaff'}
  };

  constructor() {
    super();
    this.state = {
      response: null,
      showCamera: true,
    };
    this.authSubscription = null;
    //this.ref = firebase.firestore().collection('items');
  }

  componentDidMount() {
    // firebase things?

    DeepLinking.addScheme('square-commerce-v1://');
    Linking.addEventListener('url', this.handleUrl);
 
    DeepLinking.addRoute('/payment/create?data=:id', (response) => {
      // example://test
      console.log(response + "   :::::::::: response");
      this.setState({ response });
    });
 
    /*Linking.getInitialURL().then((url) => {
      if (url) {
        console.log(url + " : : : : : : : URLSSSSSLLLLLL");
        Linking.openURL(url);
      }
    }).catch(err => console.error('An error occurred', err));*/

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
    Linking.removeEventListener('url', this.handleUrl);
    this.authSubscription();
  }

  handleUrl = ({ url }) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        DeepLinking.evaluateUrl(url);
      }
      else {
        Alert.alert("You need to download and install the Square POS app from the App store.")
      }
    });
  }

  ifForSearch = () => {
    if(this.props.navigation.state.params.mode == 'forScanAdd') {
      return
    }

    if(this.props.navigation.state.params.mode != 'forSearch') {
      return (
        <View>
          <TouchableOpacity
            style = {styles.manualcontainer}
            onPress={() => {
              const { navigate } = this.props.navigation;
              if(this.props.navigation.state.params.mode == 'sell') {
                navigate('EnterSku', { mode: 'sell' });
              }
              else {
                //WILL NEVER BE REACHED! CLEAN UP!//
                navigate('EnterSku', { forFromPrice: this.props.navigation.state.params.forFromPrice, onNavigateBack: this.props.navigation.state.params.onNavigateBack});
              }
            }}
          >
            <Text style = {styles.button}>ENTER SKU</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style = {styles.manualcontainer}
            onPress={() => {
              const { navigate } = this.props.navigation;
              if(this.props.navigation.state.params.mode == 'sell') {
                navigate('EnterPrice', { mode: 'manual' });
              }
            }}
          >
            <Text style = {styles.buttonManual}>MANUAL SALE</Text>
          </TouchableOpacity>
        </View>
      )
    }
  }

  render() {
    if(this.state.showCamera) {
      return (
        <View style={styles.container}>
          <RNCamera
              ref={ref => {
                this.camera = ref;
              }}
              style = {styles.preview}
              type={RNCamera.Constants.Type.back}
              //flashMode={RNCamera.Constants.FlashMode.on}
              permissionDialogTitle={'Permission to use camera'}
              permissionDialogMessage={'We need your permission to use your camera phone'}
              onBarCodeRead={this._handleBarCodeRead.bind(this)}
          />
          {this.ifForSearch()}
        </View>
      );
    }
    else {
        return (
            <View style={styles.containerdone}>
              <Text style={{marginTop: 15, marginLeft: 15, fontWeight: 'bold'}}>RETURN TO INVENTORY CONTROL!</Text>
            </View>
        );
    }
  }

  _handleBarCodeRead = ({ type, data }) => {
    this.setState({showCamera: false});
    //Alert.alert(`${type} and ${data}`);
    const { navigate } = this.props.navigation;
    price = "";

    self = this;

    if(this.props.navigation.state.params.mode == "sell") {

      firebase.firestore().collection("items").doc(this.state.user.email).collection('userItems').where("barcode", "==", `${data}`)
        .get()
        .then(function(querySnapshot) {
            querySnapshot.forEach(function(doc) {
                // doc.data() is never undefined for query doc snapshots
                price = doc.data().price;

                dataParameter = {
                  amount_money: {
                    amount: Number(price) * 100,
                    currency_code: "USD",
                  },

                  // Replace this value with your application's callback URL
                  callback_url: "https://fairstarter.eamondev.com/callback.html",

                  // Replace this value with your application's ID
                  client_id: "sq0idp-vHgDfd4SSLvkgAqfjZpwEg",

                  version: "1.3",
                  notes: doc.data().barcode+"/"+self.state.user.email,
                  options: {
                    supported_tender_types: ["CREDIT_CARD","CASH","OTHER","SQUARE_GIFT_CARD","CARD_ON_FILE"],
                  }
                };

                var urlL = "";
                
                if(Platform.OS === 'ios') {
                  urlL = "square-commerce-v1://payment/create?data=" + encodeURIComponent(JSON.stringify(dataParameter));
                }
                else {
                  urlL = "square-commerce-v1://payment/"+Number(price)*100+"/"+doc.data().barcode+"/"+self.state.user.email;
                }

                Linking.openURL(urlL).then(() => {
                  navigate('Inventory');
                }).catch(err => Alert.alert('There was an error:' + err.message + ". Please try again."));
            });
        })
        .catch(function(error) {
            Alert.alert(error.message);
        });
    }
    else if(this.props.navigation.state.params.mode == "forSearch") {
      navigate('Inventory', { skuForSearch: `${data}`, mode: "forSearch" });
    }
    else {

      /*firebase.firestore().collection('items').get()
        .then(snapshot => {
          Alert.alert(JSON.stringify(snapshot._docs));
          snapshot.forEach(doc => {
            Alert.alert(doc.id, '=>', doc.data());
          });
        })
        .catch(err => {
          Alert.alert('Error getting documents', err);
        });*/

      navigate('EnterPrice', { forFromPrice: self.props.navigation.state.params.forFromPrice, onNavigateBack: self.props.navigation.state.params.onNavigateBack, data: data });
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black'
  },
  containerdone: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white'
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  manualcontainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
  },
  button: {
      borderWidth: 1,
      padding: 10,
      borderColor: '#357aff',
      flex: 1,
      textAlign: 'center',
      color: '#518dff',
      backgroundColor: '#ddeaff',
      fontFamily: 'American Typewriter',
      fontWeight: 'bold'
   },
   buttonManual: {
      borderWidth: 1,
      padding: 10,
      borderColor: '#357aff',
      flex: 1,
      textAlign: 'center',
      color: '#518dff',
      backgroundColor: '#c9deff',
      fontFamily: 'American Typewriter',
      fontWeight: 'bold'
   }
});
