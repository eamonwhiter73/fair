import React from 'react';
import { StyleSheet, Text, TextInput, View, Button, Alert } from 'react-native';
import firebase from 'react-native-firebase';

export default class SignUp extends React.Component {

  static navigationOptions = {
    title: 'Sign Up',
  };

  state = {
    email: "",
    password: "",
    user: null
  };

  submitEdit = () => {
    const { navigate } = this.props.navigation;

    if(this.state.email == "") {
      Alert.alert("Please enter a valid email address, if you do not have an account please select the 'Sign Up' link below");
    }
    else {
      firebase.auth().createUserAndRetrieveDataWithEmailAndPassword(this.state.email, this.state.password).then(() => {
        navigate('Inventory');
      }).catch((error) => {
        alert(error);
      });
    }
  }

  render() {
    return (
      <View style={{paddingHorizontal: 15}}>
        <View style={{flexDirection: 'row'}}>
          <Text style={{marginTop: 25}}>Email: </Text>
          <TextInput
            style={{height: 40, borderColor: 'gray', borderWidth: 1, flex: 1, marginTop: 15, backgroundColor: '#ffffff'}}
            onChangeText={(text) => this.setState({email: text})}
            value={this.state.email}
          />
        </View>
        <View style={{flexDirection: 'row'}}>
          <Text style={{marginTop: 25}}>Password: </Text>
          <TextInput
            style={{height: 40, borderColor: 'gray', borderWidth: 1, flex: 1, marginTop: 15, backgroundColor: '#ffffff'}}
            onChangeText={(text) => this.setState({password: text})}
            value={this.state.password}
            onSubmitEditing={this.submitEdit}
            secureTextEntry={true}
          />
        </View>
      </View>
    );
  }
}