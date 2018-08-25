import React from 'react';
import { StyleSheet, Text, TextInput, View, Button, Alert } from 'react-native';
import firebase from 'react-native-firebase';

export default class SignUp extends React.Component {

  static navigationOptions = {
    headerTitle: 'Sign Up',
    headerTitleStyle: {textAlign: 'center', flex: 1, backgroundColor: '#ddeaff', color: '#518dff', fontFamily: 'American Typewriter', fontWeight: 'bold', fontSize: 20},
    headerStyle: {backgroundColor: '#ddeaff'}
  };

  state = {
    email: "",
    password: "",
    user: null
  };

  submitEdit = () => {
    const { navigate } = this.props.navigation;

    if(this.state.email == "") {
      Alert.alert("Please enter a valid email address.");
    }
    else {
      firebase.auth().createUserAndRetrieveDataWithEmailAndPassword(this.state.email, this.state.password).then(() => {
        navigate('Inventory');
      }).catch((error) => {
        Alert.alert(error);
      });
    }
  }

  render() {
    return (
      <View style={{paddingHorizontal: 15, backgroundColor: '#ddeaff', flex: 1, justifyContent: 'center'}}>
          <View style={{alignItems: 'center'}}>
            <Text style={{marginTop: 25, fontFamily: 'American Typewriter', fontWeight: 'bold', color: '#518dff'}}>Email: </Text>
            <TextInput
              style={{width: 240, height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 15, backgroundColor: '#ffffff', borderRadius: 4, paddingLeft: 5}}
              onChangeText={(text) => this.setState({email: text})}
              value={this.state.email}
            />
          </View>
          <View style={{alignItems: 'center', marginBottom: 150}}>
            <Text style={{marginTop: 15, fontFamily: 'American Typewriter', fontWeight: 'bold', color: '#518dff'}}>Password: </Text>
            <TextInput
              style={{width: 240, height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 15, backgroundColor: '#ffffff', borderRadius: 4, paddingLeft: 5}}
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