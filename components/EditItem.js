import React from 'react';
import { StyleSheet, Text, TextInput, View, Button, TouchableOpacity, Alert } from 'react-native';
import firebase from 'react-native-firebase';


export default class EditItem extends React.Component {

  static navigationOptions = {
    headerTitle: 'Edit Item',
    headerTitleStyle: {textAlign: 'center', flex: 1, backgroundColor: '#ddeaff', color: '#518dff', fontFamily: 'American Typewriter', fontWeight: 'bold', fontSize: 20},
    headerStyle: {backgroundColor: '#ddeaff'}
  };

  constructor() {
    super();
    this.state = {
      sku: "",
      description: "",
      price: "",
      quantity: ""
    };
    this.authSubscription = null;
    this.ref = null;
  }

  componentDidMount() {
    this.setState({
      sku: this.props.navigation.state.params.sku,
      description: this.props.navigation.state.params.description,
      price: this.props.navigation.state.params.price,
      quantity: String(this.props.navigation.state.params.quantity)
    })

    this.ref = firebase.firestore().collection('items').doc(this.state.user.email).collection('userItems');
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

  updateInventory = () => {

    if(this.state.description != null || this.state.quantity != null || this.state.price != null || isNaN(parseInt(this.state.price)) || isNaN(parseInt(this.state.quantity))) {
      Alert.alert(
        'SAVING',
        'Are you sure you want to save this information?',
        [
          {text: 'Cancel', onPress: () => {
            navigate('Inventory');
          }},
          {text: 'OK', onPress: () => {

            this.ref.where("barcode", "==", this.state.sku).onSnapshot((snap) => {
              console.log(snap);

              snap._changes[0]._document._ref.update({
                  description: this.state.description,
                  price: this.state.price,
                  quantity: this.state.quantity
              }).then(() => {
                Alert.alert("SAVED", "Inventory updated!");
              }).catch(err => {
                Alert.alert(err);
              })
            });      
            
          }},
        ],
        { cancelable: false }
      )
    }
  }

  getCircularReplacer = () => {
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

  deleteItem = () => {

    this.ref.where("barcode", "==", this.state.sku).onSnapshot((snap) => {
      snap.forEach(doc => {
        console.log(JSON.stringify(doc, this.getCircularReplacer()) + "SNAPPPPPP ******");
        doc.ref.delete().then(() => {
          const { navigate } = this.props.navigation;

          navigate('Inventory');
        }).catch(error => Alert.alert(error));
      })
    }); 
  }  

  render() {
    return (
      <View style={{paddingHorizontal: 15, flex: 1, backgroundColor: '#ddeaff'}}>
        <View style={{alignItems: 'center', marginTop: 50}}>
          <Text style={{marginTop: 25, fontFamily: 'American Typewriter', fontWeight: 'bold', color: '#518dff'}}>Description: </Text>
          <TextInput
            style={{width: 240, height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 15, backgroundColor: '#ffffff', borderRadius: 4, paddingLeft: 5}}
            onChangeText={(text) => this.setState({description: text})}
            value={this.state.description}
            placeholder={this.state.description}
          />
        </View>
        <View style={{alignItems: 'center'}}>
          <Text style={{marginTop: 25, fontFamily: 'American Typewriter', fontWeight: 'bold', color: '#518dff'}}>Price ($): </Text>
          <TextInput
            style={{width: 240, height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 15, backgroundColor: '#ffffff', borderRadius: 4, paddingLeft: 5}}
            onChangeText={(text) => this.setState({price: text})}
            value={this.state.price}
            placeholder={this.state.price}
          />
        </View>
        <View style={{alignItems: 'center'}}>
          <Text style={{marginTop: 25, fontFamily: 'American Typewriter', fontWeight: 'bold', color: '#518dff'}}>Quantity: </Text>
          <TextInput
            style={{width: 240, height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 15, backgroundColor: '#ffffff', borderRadius: 4, paddingLeft: 5}}
            onChangeText={(text) => this.setState({quantity: text})}
            value={this.state.quantity}
            placeholder={this.state.quantity}
          />
        </View>
        <View style={{flex: 0.5, justifyContent: 'center', alignItems: 'center'}}>
        <TouchableOpacity
          style = {styles.container}
          onPress={() => {
            this.updateInventory()
          }}
        >
          <Text style = {styles.button}>SAVE</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style = {styles.container}
          onPress={() => {
            this.deleteItem();
          }}
        >
          <Text style = {styles.button}>DELETE</Text>
        </TouchableOpacity>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create ({
   container: {
      flexDirection: 'row',
      //justifyContent: 'center',
      marginTop: 25,
      //alignItems: 'flex-end',
      borderColor: '#518dff',
      borderRadius: 4,
      borderWidth: 1,
   },
   button: {
      flexDirection: 'row',
      borderWidth: 1,
      padding: 10,
      borderColor: '#518dff',
      borderRadius: 4,
      flex: 0.65,
      textAlign: 'center',
      color: '#518dff',
      color: 'white',
      fontFamily: 'American Typewriter',
      backgroundColor: '#518dff',
      fontWeight: 'bold'
   }
})