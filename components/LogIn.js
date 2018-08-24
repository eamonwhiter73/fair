import React from 'react';
import { StyleSheet, Text, TextInput, View, Button, Alert, TouchableOpacity } from 'react-native';
import firebase from 'react-native-firebase';

export default class LogIn extends React.Component {

  static navigationOptions = {
    headerTitle: 'Log In',
    headerTitleStyle: {textAlign: 'center', flex: 1, backgroundColor: '#ddeaff', color: '#518dff', fontFamily: 'American Typewriter', fontWeight: 'bold', fontSize: 20},
    headerStyle: {backgroundColor: '#ddeaff'}
  };

  state = {
    email: "",
    password: "",
    loading: true
  };

  constructor() {
    super();
    this.authSubscription = null;
  }

  submitEdit = () => {
    const { navigate } = this.props.navigation;

    if(this.state.email == "") {
      Alert.alert("Please enter a valid email address, if you do not have an account please select the 'Sign Up' link below");
    }
    else {
      firebase.auth().signInAndRetrieveDataWithEmailAndPassword(this.state.email, this.state.password).then(() => {
        navigate('Inventory', { mode: 'fromLogIn' });
      });
    }
  }

  componentDidMount() {
    this.authSubscription = firebase.auth().onAuthStateChanged((user) => {
      this.setState({
        loading: false,
        user,
      });

      // The user is an Object, so they're logged in
      if (this.state.user) {
        const { navigate } = this.props.navigation;

        navigate('Inventory', { mode: 'fromLogIn' });
      }
    });
  }

  componentWillUnmount() {
    this.authSubscription();
  }

  render() {
    // The application is initialising
    if (this.state.loading) return null;

    return (
      <View style={{paddingHorizontal: 15, backgroundColor: '#ddeaff'}}>
        <View style={{}}>
          <Text style={{marginTop: 25, fontFamily: 'American Typewriter', fontWeight: 'bold', color: '#518dff'}}>Email: </Text>
          <TextInput
            style={{height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 15, backgroundColor: '#ffffff'}}
            onChangeText={(text) => this.setState({email: text})}
            value={this.state.email}
          />
        </View>
        <View style={{}}>
          <Text style={{marginTop: 15, fontFamily: 'American Typewriter', fontWeight: 'bold', color: '#518dff'}}>Password: </Text>
          <TextInput
            style={{height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 15, backgroundColor: '#ffffff'}}
            onChangeText={(text) => this.setState({password: text})}
            value={this.state.password}
            onSubmitEditing={this.submitEdit}
            secureTextEntry={true}
          />
        </View>
        <TouchableOpacity
            style = {styles.sellcontainer}
            onPress={() => {
              const { navigate } = this.props.navigation;
              navigate('SignUp')
            }}
          >
            <Text style = {styles.button}>No account? Sign Up!</Text>
          </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create ({
   sellcontainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 15
   },
   button: {
      borderWidth: 1,
      padding: 10,
      borderColor: 'black',
      flex: 1,
      textAlign: 'center',
      color: 'white',
      fontFamily: 'American Typewriter',
      backgroundColor: '#518dff'

   }
})