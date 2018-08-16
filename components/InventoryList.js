import React from 'react';
import { StyleSheet, Text, TextInput, View, Button, FlatList, TouchableOpacity } from 'react-native';
import firebase from 'react-native-firebase';
import { SearchBar } from 'react-native-elements'

export default class InventoryList extends React.Component {

  state = {
    items: [],
    loading: true,
    searchText: "",
    searchObjs: []
  };

  constructor() {
    super();
    this.ref = firebase.firestore().collection('items');
    this.unsubscribe = null;
    this.authSubscription = null;
  }

  componentDidMount() {
    this.unsubscribe = this.ref.onSnapshot(this.onCollectionUpdate) 
  }

  componentWillMount() {
    //EVENTUALLY RECEIVE THIS FROM PARENT INVENTORY COMPONENT//
    this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
      this.setState({
        loading: false,
        user,
      });
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
    this.authSubscription();
  }

  onCollectionUpdate = (querySnapshot) => {
    const items = [];

    querySnapshot.forEach((doc) => {
      const { barcode, description, email, price, quantity } = doc.data();

      if(email == this.props.returnemail()) {
        items.push({
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

    this.setState({ 
      items,
      loading: false
    });
  }

  search = () => {
    var self = this;

    this.ref.where("email", "==", this.state.user.email)
      .get()
      .then(function(querySnapshot) {
          var searchObjs = [];
          querySnapshot.forEach(function(doc) {
              // doc.data() is never undefined for query doc snapshots
              console.log(doc.id, " => THIS IS FROM SEARCH FUNCTAION => ", doc.data());
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

          self.setState({items: searchObjs});
      })
      .catch(function(error) {
          console.log("Error getting documents: ", error);
      });

  }

  clear = () => {
    var self = this;

    this.ref.where("barcode", "!=", null)
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
          console.log("Error getting documents: ", error);
      });
  }

  scan = () => {
    this.props.navigation('BarcodeScanner', { mode: "forSearch" });
  }

  componentWillReceiveProps(props) {
    console.log(props);
    this.setState({searchText: props.searchSku()});
  }

  render() {
    if (this.state.loading) {
      return null; // or render a loading icon
    }

    return (
      <View style={{marginTop: 15}}>
        <View style={{flexDirection: 'row', marginBottom: 10}}>
          <Text style={{flex: 1, fontWeight: 'bold', textDecorationLine: 'underline', fontSize: 16, textAlign: 'center'}}>Inventory</Text>
        </View>
        <View style={{flexDirection: 'row'}}>
          <SearchBar
          searchIcon={false} // You could have passed `null` too
          onChangeText={(text) => this.setState({searchText: text})}
          onClear={this.clear.bind(this)}
          onSubmitEditing={this.search.bind(this)}
          placeholder='Search SKU or Description...'
          containerStyle={{flex: 1}}
          value={this.state.searchText}
          />
          <TouchableOpacity
            style = {styles.editcontainer}
            onPress={() => { 
              this.scan();
            }}>
            <Text style = {styles.buttonEdit}>SCAN</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          style={{paddingBottom: 1}}
          data={this.state.items}
          renderItem={({item}) => this.props.callback(item)}
          contentContainerStyle={{marginBottom: -49}}
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
      borderColor: 'black',
      flex: 1,
      textAlign: 'center',
      color: 'blue',
      backgroundColor: '#aaa'
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