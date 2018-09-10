import React from 'react';
import { StyleSheet, Text, TextInput, View, Button, FlatList, TouchableOpacity, Platform } from 'react-native';
import firebase from 'react-native-firebase';
import { SearchBar } from 'react-native-elements';

export default class InventoryList extends React.Component {

  state = {
    items: [],
    loading: true,
    searchText: "",
    searchObjs: []
  };

  constructor() {
    super();
    this.unsubscribe = null;
    this.authSubscription = null;
    this.refTwo = firebase.firestore().collection('items');
  }

  componentDidMount() {
    console.log("user email: " + this.state.user.email);
    this.unsubscribe = this.refTwo.doc(this.state.user.email).collection('userItems').onSnapshot(this.onCollectionUpdate);
  }

  componentWillMount() {
    //EVENTUALLY RECEIVE THIS FROM PARENT INVENTORY COMPONENT//
    this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
      //console.log(user.email + " user email");
      //this.ref = firebase.firestore().collection('items').doc(user.email).collection('userItems');

      this.setState({
        loading: false,
        user,
      })
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.authSubscription();
  }

  onCollectionUpdate = (querySnapshot) => {
    const items = [];
    console.log(querySnapshot._docs + " querySnapshot");

    querySnapshot.forEach((doc) => {
      const { barcode, description, email, price, quantity } = doc.data();

      //if(email == this.state.user.email) {
        items.push({
          key: doc.id,
          doc, // DocumentSnapshot
          barcode,
          description,
          email,
          price,
          quantity
        });
      //}
    })

    this.setState({ 
      items: items,
      loading: false
    })

  }

  search = () => {
    var self = this;

    self.refTwo.doc(this.state.user.email).collection('userItems')
      .get()
      .then(function(querySnapshot) {
          var searchObjs = [];
          querySnapshot.forEach(function(doc) {
              // doc.data() is never undefined for query doc snapshots
              console.log(doc.id, " => THIS IS FROM SEARCH FUNCTION => ", doc.data());
              const { barcode, description, email, price, quantity } = doc.data();
              //console.log("Searchtext: " + this.state.searchText);
              if(doc.data().barcode.includes(self.state.searchText)) {

                searchObjs.push({
                  key: doc.id,
                  doc, // DocumentSnapshot
                  barcode,
                  description,
                  email,
                  price,
                  quantity
                });
                
              }
              else if(doc.data().description.includes(self.state.searchText)) {

                console.log("in includes");

                searchObjs.push({
                  key: doc.id,
                  doc, // DocumentSnapshot
                  barcode,
                  description,
                  email,
                  price,
                  quantity
                });                
              }
          });

          return searchObjs;
          //self.setState({items: searchObjs});
      })
      .then((obj) => {
        this.setState({items: obj});
        console.log(this.state.items);
      })
      .catch(function(error) {
          Alert.alert(error.message);
      });

  }

  clear = () => {
    var self = this;

    this.refTwo.doc(this.state.user.email).collection('userItems').where("barcode", "!=", null)
      .get()
      .then(function(querySnapshot) {
          var items = [];

          querySnapshot.forEach(function(doc) {
              // doc.data() is never undefined for query doc snapshots
              console.log(doc.id, " => THIS IS FROM CLEAR FUNCTION =>", doc.data());

              const { barcode, description, email, price, quantity } = doc.data();

              items.push({
                key: doc.id,
                doc, // DocumentSnapshot
                barcode,
                description,
                email,
                price,
                quantity
              });
          });

          self.setState({items: items});
      })
      .catch(function(error) {
          Alert.alert(error.message);
      });
  }

  scan = () => {
    this.props.navigation('BarcodeScanner', { mode: "forSearch" });
  }

  componentWillReceiveProps(props) {
    console.log(props);
    this.setState({searchText: props.searchSku()});
    if(this.state.items == [] && props.initialItem != null) {
      this.setState({items: [props.initialItem]});
    }
    else if(props.removeInitialItem()) {
      this.setState({items: []});
    }
  }

  render() {
    if (this.state.loading) {
      return null; // or render a loading icon
    }

    return (
      <View style={{marginTop: 15, flex: 0.99}}>
        <View style={{flexDirection: 'row', marginBottom: 10}}>
          <Text style={{color: '#518dff', fontFamily: 'American Typewriter', flex: 1, fontWeight: 'bold', fontSize: 18, textAlign: 'center'}}>Inventory</Text>
        </View>
        <View style={{flexDirection: 'row'}}>
          <SearchBar
          searchIcon={false} // You could have passed `null` too
          onChangeText={(text) => this.setState({searchText: text})}
          onClear={this.clear.bind(this)}
          onSubmitEditing={this.search.bind(this)}
          placeholder='Search SKU or Description...'
          containerStyle={{flex: 1, borderRadius: 4, backgroundColor: '#ddeaff', borderTopColor: '#357aff', borderBottomColor: '#357aff', borderWidth: 1, borderColor: '#357aff', borderStyle: 'solid'}}
          inputStyle={{backgroundColor: '#ffffff'}}
          value={this.state.searchText}
          lightTheme={true}
          placeholderTextColor='#dddddd'
          />
          <TouchableOpacity
            style = {styles.editcontainer}
            onPress={() => { 
              this.scan();
            }}>
            <Text style = {styles.buttonEdit}>SCAN</Text>
          </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row'}}>
          <Text style={{fontWeight: 'bold', fontSize: 10, flex: 1, textAlign: 'center', marginTop: 10}}>TAP ITEM TO SELL</Text>
        </View>
        <FlatList
          style={{paddingBottom: 1}}
          data={this.state.items}
          renderItem={({item}) => this.props.callback(item)}
          contentContainerStyle={{justifyContent: 'flex-end'}}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create ({
   container: {
      justifyContent: 'center',
      alignItems: 'center',
   },
   buttonEdit: {
      borderWidth: 1,
      padding: 15,
      borderColor: '#357aff',
      borderRadius: 4,
      flex: 1,
      textAlign: 'center',
      color: '#518dff',
      backgroundColor: '#ddeaff',
      fontFamily: 'American Typewriter',
      fontWeight: 'bold'
   },
   button: {
      borderWidth: 1,
      padding: 10,
      borderColor: 'black',
      flex: 1,
      textAlign: 'center',
      color: 'blue',
      backgroundColor: '#aaa'
   },
   editcontainer: {
      alignItems: 'flex-end',
      flex: 0.3
   }
})