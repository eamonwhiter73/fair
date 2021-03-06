import React from 'react';
import { StyleSheet, Text, TextInput, View, Button, Alert, TouchableOpacity, Image, Animated } from 'react-native';
import firebase from 'react-native-firebase';

export default class LogIn extends React.Component {

  static navigationOptions = {
    headerTitle: 'Log In',
    headerTitleStyle: {textAlign: 'center', flex: 1, backgroundColor: '#ddeaff', color: '#518dff', fontFamily: 'American Typewriter', fontWeight: 'bold', fontSize: 20},
    headerStyle: {backgroundColor: '#ddeaff'},
    headerLeft: null
  };

  state = {
    email: "",
    password: "",
    loading: true,
    yPosition: new Animated.Value(0),  // Initial value for opacity: 0
    fadeAnim: new Animated.Value(1)  // Initial value for opacity: 0
  };

  constructor() {
    super();
    this.authSubscription = null;
  }

  submitEdit = () => {
    const { navigate } = this.props.navigation;

    Animated.timing(this.state.fadeAnim, {
      toValue: 1,
      duration: 1,
    }).start();

    Animated.timing(this.state.yPosition, {
      toValue: 0,
      duration: 1,
    }).start();

    if(this.state.email == "") {
      Alert.alert("Please enter a valid email address, if you do not have an account please select the 'Sign Up' link below");
    }
    else {
      firebase.auth().signInAndRetrieveDataWithEmailAndPassword(this.state.email, this.state.password).then(() => {
        navigate('Inventory', { mode: 'fromLogIn' });
      }).catch(err => {
        Alert.alert(err.message);
      });
    }
  }

  animateUp = () => {
    console.log("animateUp");

    Animated.timing(this.state.yPosition, {
        toValue: -103,
        duration: 300,
    }).start();

    Animated.timing(this.state.fadeAnim, {
        toValue: 0,
        duration: 1,
    }).start();
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

    let { yPosition } = this.state;
    let { fadeAnim } = this.state;

    return (
      <View style={{flex: 1, paddingHorizontal: 15, backgroundColor: '#ddeaff'}}>
        <View style={{justifyContent: 'center', alignItems: 'center', paddingTop: 50}}>
          <Image
            style={styles.stretch}
            source={require('../assets/blogosplash200.png')}
          />
        </View>
        <Animated.View style={{alignItems: 'center', opacity: fadeAnim}}>
          <Text style={{marginTop: 25, fontFamily: 'American Typewriter', fontWeight: 'bold', color: '#518dff'}}>Email: </Text>
          <TextInput
            style={{width: 240, height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 15, backgroundColor: '#ffffff', borderRadius: 4, paddingLeft: 5}}
            onChangeText={(text) => this.setState({email: text})}
            value={this.state.email}
          />
        </Animated.View>
        <Animated.View style={{alignItems: 'center', marginTop: yPosition, position: 'relative'}}>
          <Text style={{marginTop: 15, fontFamily: 'American Typewriter', fontWeight: 'bold', color: '#518dff'}}>Password: </Text>
          <TextInput
            style={{width: 240, height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 15, backgroundColor: '#ffffff', borderRadius: 4, paddingLeft: 5}}
            onChangeText={(text) => this.setState({password: text})}
            value={this.state.password}
            onSubmitEditing={this.submitEdit}
            secureTextEntry={true}
            onFocus={this.animateUp}
          />
        </Animated.View>
        <View style={{flex: 1, justifyContent: 'flex-end', marginBottom: 15}}>
          <View style={{flexDirection: 'row'}}>
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
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create ({
   sellcontainer: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 4,
      borderColor: '#518dff',
   },
   button: {
      padding: 10,
      textAlign: 'center',
      color: 'white',
      fontFamily: 'American Typewriter',
      backgroundColor: '#518dff',
   },
   stretch: {
      width: 200,
      height: 200,
   }
})