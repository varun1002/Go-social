import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  Button,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import { AccessToken, LoginManager } from "react-native-fbsdk";
import { f, auth } from "../../../config/config.js";
import * as EmailValidator from "email-validator";
import styles from "./style";
import { SocialIcon } from "react-native-elements";
export default class LoginScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      Password: "",
    };
  }

  componentDidMount() {
    var that = this;

    auth.onAuthStateChanged(function (user) {
      if (user) {
        that.redirectUser();
      }
    });
  }

  login() {
    let email = this.state.email;
    let password = this.state.Password;

    let { navigate } = this.props.navigation;

    auth
      .signInWithEmailAndPassword(email, password)
      .then(function (data) {
        navigate("App");
      })
      .catch(function (error) {
        var errorMessage = error.message;
        alert(errorMessage.toString());
      });
  }

  redirectUser() {
    const { navigate } = this.props.navigation;
    navigate("App");
  }

  _signInAsync = async () => {
    if (EmailValidator.validate(this.state.email) === true) {
      if (this.state.Pasword != "") {
        this.login();
      } else {
        alert("Enter the password");
      }
    } else {
      alert("Please enter A Valid Email");
    }
  };

  onPressLogin() {
    LoginManager.logInWithPermissions(["public_profile", "email"]).then(
      result => this._handleCallBack(result),
      function (error) {
        alert("Login fail with error: " + error);
      }
    );
  }

  _handleCallBack(result) {
    let _this = this;
    if (result.isCancelled) {
      alert("Login cancelled");
    } else {
      AccessToken.getCurrentAccessToken().then(data => {
        const token = data.accessToken;
        fetch(
          "https://graph.facebook.com/v2.8/me?fields=id,first_name,last_name,gender,birthday&access_token=" +
            token
        )
          .then(response => response.json())
          .then(json => {
            const imageSize = 120;
            const facebookID = json.id;
            const fbImage = `https://graph.facebook.com/${facebookID}/picture?height=${imageSize}`;
            this.authenticate(data.accessToken).then(function (result) {
              const { uid } = result;
              _this.createUser(uid, json, token, fbImage);
            });
          })
          .catch(function (err) {
            console.log(err);
          });
      });
    }
  }

  authenticate = token => {
    const provider = auth.FacebookAuthProvider;
    const credential = provider.credential(token);
    let ret = auth.signInWithCredential(credential);
    return ret;
  };

  createUser = (uid, userData, token, dp) => {
    const defaults = {
      uid,
      token,
      dp,
      ageRange: [20, 30],
    };
    f.database()
      .ref("users")
      .child(uid)
      .update({ ...userData, ...defaults });
  };

  _signInAsync = async () => {
    if (EmailValidator.validate(this.state.email) === true) {
      if (this.state.Pasword != "") {
        this.login();
      } else {
        alert("Enter the password");
      }
    } else {
      alert("Please enter A Valid Email");
    }
  };

  render() {
    return (
      <View style={styles.firstContainer}>
        <ScrollView style={styles.scrollStyle}>
          <View style={styles.container}>
            <KeyboardAvoidingView behavior="position">
              <View style={styles.logoContainer}>
                <Image source={require("../../images/logo.png")} style={styles.logo} />
              </View>
              <View style={styles.formContainer}>
                <TextInput
                  placeholder="Email"
                  keyboardType="email-address"
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  style={styles.input}
                  onChangeText={text => this.setState({ email: text })}
                  ref={input => {
                    this.textInput = input;
                  }}
                />
                <TextInput
                  placeholder="Pasword"
                  secureTextEntry={true}
                  placeholderTextColor="rgba(255,255,255,0.7)"
                  style={styles.input}
                  onChangeText={text => this.setState({ Password: text })}
                  ref={input => {
                    this.textInput = input;
                  }}
                />
              </View>
            </KeyboardAvoidingView>
            <TouchableOpacity onPress={this._signInAsync} style={styles.loginButton}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => this.props.navigation.navigate("ForgotPassword")}>
              <Text style={styles.text}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={this.onPressLogin.bind(this)}>
              <SocialIcon
                style={{ width: 200 }}
                title="Sign In With Facebook"
                button
                type="facebook"
              />
            </TouchableOpacity>

            <View style={styles.signUpTextArea}>
              <TouchableOpacity onPress={() => this.props.navigation.navigate("Signup")}>
                <Text style={styles.text}>
                  Don't have an account?
                  <Text style={{ color: "#0066cc" }}> Sign Up</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              onPress={() => this.props.navigation.navigate("App")}
              title="Skip Login "
              color="#000"
            />
          </View>
        </ScrollView>
      </View>
    );
  }
}
