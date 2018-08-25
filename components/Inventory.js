import React from 'react';
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Alert } from 'react-native';
import { Icon } from 'react-native-elements';
import firebase from 'react-native-firebase';

import InventoryList from './InventoryList';
import LogIn from './LogIn';


export default class Inventory extends React.Component {

  constructor() {
    super();
    this.ref = firebase.firestore().collection('items');
    this.authSubscription = null;
  }

  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: 'Inventory Control',
      headerLeft: null,
      headerRight: (
        <Icon name={'exit-to-app'}
              onPress={() => {
                Alert.alert(
                  'Logout',
                  'Are you sure you want to logout?',
                  [
                    {text: 'Cancel', onPress: () => {
                      console.log("Canceled Logout.")
                    }},
                    {text: 'OK', onPress: () => {

                      firebase.auth().signOut()
                        .then(() => { 
                          navigation.navigate('LogIn');
                        })
                        .catch(err => {
                          Alert.alert(err);
                        })  
                      
                    }},
                  ],
                  { cancelable: false }
                )
              }}
              iconStyle={{marginRight: 11, fontSize: 30, color: '#518dff'}}
        />
      ),
      headerTitleStyle: {textAlign: 'center', flex: 1, backgroundColor: '#ddeaff', color: '#518dff', fontFamily: 'American Typewriter', fontWeight: 'bold', fontSize: 20},
      headerStyle: {backgroundColor: '#ddeaff'}
    }
  };

  state = {
    text: "__",
    price: "__",
    quantity: "",
    description: "",
    loading: true
  }

  leave = () => {
    
  }

  changeData = (data) => {
    if (data != null) {
      this.setState({text: `${data}`})
    }
    else {
      this.setState({text: "__"})
    }
  }

  changePrice = (price) => {
    if (price != null) {
      this.setState({price: `${price}`})
    }
    else {
      this.setState({price: "__"})
    }
  }

  addItem() {
    this.ref.doc(this.state.user.email).collection('userItems').add({
      //[this.state.user.email]: {
        barcode: this.state.text,
        description: this.state.description,
        price: this.state.price,
        quantity: this.state.quantity,
        email: this.state.user.email
      //}
    });

    this.setState({
      text: "__",
      price: "__",
      quantity: "",
      description: ""
    });
  }

  submit = () => {
    if(this.state.text == '__' || this.state.description == "" || this.state.price == '__' || this.state.quantity == "" || isNaN(parseInt(this.state.quantity))) {
      Alert.alert("Please enter all information.")
    }
    else {
      this.addItem();
    }
  }

  componentDidMount() {
    // The user is an Object, so they're logged in
    if (!this.state.user) {
      const { navigate } = this.props.navigation;

      navigate('LogIn');
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

  edit = (item) => {
    const { navigate } = this.props.navigation;

    navigate('EditItem', { sku: item.barcode, description: item.description, quantity: item.quantity, price: item.price});
  }

  myCallback = (item) => {
    console.log("myCallback getting called-----------------------");
    if (this.state.user && item.email == this.state.user.email) {
        console.log("email = email !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        return ( 
          <View style={{flex: 1, flexDirection: 'row'}}>
            <Text style={{marginTop: 10, flex: 0.8}}>SKU: {item.barcode} | Description: {item.description} | Quantity: {item.quantity} | Price: ${item.price}</Text>
            <TouchableOpacity
              style = {styles.editcontainer}
              onPress={() => { 
                this.edit(item)
              }}>
              <Text style = {styles.buttonTextAdjust}>EDIT</Text>
            </TouchableOpacity>
          </View>
        )
    }
    else {
      return null
    }
  }
 
  returnEmail = () => {
    if(this.state.user != null) {
      return this.state.user.email
    }
    else {
      return "";
    }
  }

  searchSkuFunc = () => {
    if(this.props.navigation.state.params && this.props.navigation.state.params.mode == 'forSearch') {
      return this.props.navigation.state.params.skuForSearch;
    }
    
    return;
  }

  render() {
    // The application is initialising
    if (this.state.loading) return null;

    return (
      <View style={{paddingTop: 15, paddingHorizontal: 15, paddingBottom: 15, flex: 1, backgroundColor: "#fff"}}>
        <View style={{flex: 1}}>
          <TouchableOpacity
            style = {styles.container}
            onPress={() => {
              const { navigate } = this.props.navigation;

              if(this.state.text != null) {
                navigate('BarcodeScanner', { onNavigateBack: this.changeData.bind(this), forFromPrice: this.changePrice.bind(this), mode: 'forScanAdd' })}
              }
            }
          >
            <Text style = {styles.button}>SCAN ITEM</Text>
          </TouchableOpacity>
          <Text style={{}}>{'\n'}SKU: {this.state.text} | Price: ${this.state.price}{"\n"}</Text>
          <View style={{flexDirection: 'row'}}>
            <Text style={{marginTop: 10}}>Description: </Text>
            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1, flex: 0.74, marginRight: 15, backgroundColor: '#ffffff', paddingLeft: 5}}
              onChangeText={(text) => this.setState({description: text})}
              value={this.state.description}
              placeholder="ex. necklace"
            />
            <Text style={{marginTop: 10}}>Quantity: </Text>
            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1, flex: 0.26, backgroundColor: '#ffffff', paddingLeft: 5}}
              onChangeText={(text) => this.setState({quantity: text})}
              value={this.state.quantity}
            />
          </View>
          <View style={{paddingTop: 15}}>
            <TouchableOpacity
              style = {styles.container}
              onPress={() => {
                this.submit()
              }}
            >
              <Text style = {styles.button}>ADD ITEM</Text>
            </TouchableOpacity>
          </View>
          <InventoryList
            callback={this.myCallback.bind(this)}
            returnemail={this.returnEmail}
            searchSku={this.searchSkuFunc.bind(this)}
            navigation={this.props.navigation.navigate}
          />
        </View>
        <TouchableOpacity
          style = {styles.sellcontainer}
          onPress={() => {
            const { navigate } = this.props.navigation;

            navigate('BarcodeScanner', { mode: "sell"})
          }}
        >
          <Text style = {styles.button}>SELL ITEM</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create ({
   container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
   },
   sellcontainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      height: 41
   },
   editcontainer: {
      justifyContent: 'center',
      alignItems: 'flex-end',
      marginTop: 10,
      flex: 0.2
   },
   button: {
      borderWidth: 1,
      padding: 10,
      borderColor: '#357aff',
      borderRadius: 4,
      flex: 1,
      textAlign: 'center',
      color: '#518dff',
      backgroundColor: '#ddeaff',
      fontFamily: 'American Typewriter',
      fontWeight: 'bold',
      marginBottom: 1,
      marginTop: 1
   },
   buttonTextAdjust: {
      borderWidth: 1,
      padding: 10,
      borderColor: '#357aff',
      borderRadius: 4,
      flex: 1,
      textAlign: 'center',
      color: '#518dff',
      backgroundColor: '#ddeaff',
      fontFamily: 'American Typewriter',
   },
})