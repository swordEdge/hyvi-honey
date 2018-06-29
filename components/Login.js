'use strict';
var React = require('react-native');
var Button = require('react-native-button');
var Actions = require('react-native-router-flux').Actions;
var Parse = require('parse/react-native');
var ParseReact = require('parse-react/react-native');
var ParseComponent = ParseReact.Component(React);
import CONFIG from '../lib/config';
import Global from './Global';
var FBLoginManager = require('NativeModules').FBLoginManager;
// var ActivityIndicatorIOS = require('react-native-activity-indicator-ios');

var {
	StyleSheet,
	View,
	TextInput,
	ActivityIndicatorIOS,
	Text,
} = React;

class Login extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: {
				email: 'Test13@gmail.com',
				password: 'asdf',
			},
			loading: false
		};
		// Parse.initialize(CONFIG.PARSE.APP_ID, CONFIG.PARSE.JAVASCRIPT_KEY);
	}

	observe(props, state) {
	    return {
	      	user: ParseReact.currentUser
	    };
	}

	checkLogin() {
        var success = true;
        var state = this.state.value;
        for(var key in state){
        	// console.log(key + ": " + state[key]);
          	if(state[key].length <= 0) {
            	success = false;
          	}
        }

        if(success) {
          	this._doLogin();
        } else {
        	console.log('Form Validation Error');
          	//show alert
          	// AlertIOS.alert('Error','Please complete all fields',
           //  	[{text: 'Okay', onPress: () => console.log('')}]
          	// );
        }
    }

    _doLogin() {
      	var parent = this;
      	this.state.loading = true;
      	Parse.User.logIn(this.state.value.email, this.state.value.password, {
		  	success: function(user) {
		    	parent.state.loading = false;
		    	Global.currentUser = user;
		    	console.log('Login Success: ', Global.currentUser);
		    	Actions.channels_overview();
		  	},
		  	error: function(user, error) {
		  		parent.state.loading = false;
		    	console.log('Incorrect username or password:', user, error);
		    	alert('Invalid username or password.');
		  	}
		});
    }

    fbLogin() {
	    FBLoginManager.loginWithPermissions(["email","user_friends"], function(error, data){
		  	if (!error) {
		    	console.log("Login data: ", data);
		    	var authData = {
	                id: data.credentials.userId,
	                access_token: data.credentials.token,
	            	expiration_date: data.credentials.tokenExpirationDate
	            };

	            //sign up into parse db
	            Parse.FacebookUtils.logIn(authData, {
	                success: (user) => {
	                    if (user.existed()) {
	                      	// login: nothing to do
	                      	console.log('User Already Logged In');
	                      	// that.setState({loadingCurrentUser: false});
	                      	// that.props.navigator.immediatelyResetRouteStack([{ name: 'home'}]);
	                    } else {
	                      	// signup: update user data, e.g. email
	                      	console.log('getting user additional information');
	                      	var data = user.get('authData').facebook;
	                      	var api = 'https://graph.facebook.com/v2.3/'+data.id+'?fields=name,email&access_token='+data.access_token;

	                      	var fetchProfile = new FBSDKGraphRequest((error, result) => {
		                        if (error) {
		                          	// TODO: error
		                          	// this.setState({loadingCurrentUser: false});
		                          	console.log('fetch error: ', error);
		                        } else {
		                          	console.log(result);
		                          	var name = responseData.name;
		                          	var email = responseData.email;

		                        	// FIXME: https://github.com/ParsePlatform/ParseReact/issues/45
		                          	var userId = {
		                            	className: '_User',
		                            	objectId: user.id
		                          	};

		                          	ParseReact.Mutation.Set(userId, {
			                            username: email,
			                            email: email,
			                            fullname: name,
			                            sound: false,
							            vibration: false,
							            feedback: false,
							            message: false,
							            friend_request: false
		                          	}).dispatch();

		                          	// that.setState({loadingCurrentUser: false});
		                          	// that.props.navigator.immediatelyResetRouteStack([{ name: 'onboarding'}]);
		                        }
	                    	}, '/me?fields=name,email');
	                      	// FIXME https://github.com/facebook/react-native-fbsdk/issues/20
	                      	// fetchProfile.start();
	                      	FBSDKGraphRequestManager.batchRequests([fetchProfile], function() {}, 10)
	                    }
	                },
	                error: (user, error) => {
	                    console.log('Error', error.message);
	                    switch (error.code) {
	                      	case Parse.Error.INVALID_SESSION_TOKEN:
	                        	Parse.User.logOut().then(() => {
	                          		this.onFacebookLogin(token);
	                        	});
	                        	break;
	                      	default:
	                        // TODO: error
	                    }
	            	    that.setState({loadingCurrentUser: false});
	                	that.setState({errorMessage: error.message});
	                }
	            });
		  	} else {
				console.log("Error: ", data);
		  	}
		})
    }

    _fbLogin() {
    	var newObj = ParseReact.Mutation.Create('Channel', {
    		Caption: 'Test channel',
    		members: ['ewrewrewr'],
    	}).dispatch()
    	.then(function(data) {
    		console.log('Succeeded: ', data);
    	});
    	console.log('New object: ', newObj);
    }

	render(){
		return (
			<View style={styles.container}>
				<View style={styles.title}>
					<Text style={styles.titleText}>Login</Text>
				</View>
				<View style={styles.formStyle}>
					<View style={styles.inputs}>
						<View style={styles.inputContainer}>
							<TextInput 
								style={styles.input}
								placeholder="Email"
								value={this.state.value.email}
								onChangeText={text => this.setState({
									value:{email: text, password: this.state.value.password}
								})}
								ref='emailInput'
							/>
						</View>
						<View style={styles.inputContainer}>
							<TextInput
								password={true}
								style={styles.input}
								placeholder="Pasword"
								value={this.state.value.password}
								onChangeText={text => this.setState({
									value:{password: text, email: this.state.value.email}
								})}
								ref='passwordInput'
							/>
						</View>
					</View>
					<Button style={[styles.signin, styles.whiteFont, styles.button]} onPress={this.checkLogin.bind(this)}>
						LOG IN
					</Button>
					<Button style={[styles.fblogin, styles.whiteFont, styles.button]} onPress={this.fbLogin.bind(this)}>
						LOG IN WITH FACEBOOK
					</Button>
				</View>
				<ActivityIndicatorIOS animating={this.state.loading} />
				<Button style={styles.signup} onPress={Actions.register}>
					Don't have an account?
				</Button>
				
			</View>
		);
	}
}

var styles = StyleSheet.create({
	container: {
		flexDirection: 'column',
		flex: 1,
		backgroundColor: '#F6F4EE',
		padding: 20
	},
	title: {
		flex: 0.1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	titleText: {
		color: '#1D3DBF',
		fontSize: 18,
	},
	signin: {
		backgroundColor: '#0066CD',
		padding: 20,
	},
	fblogin: {
		backgroundColor: '#4b62a1',
		padding: 20,
	},
	signup: {
		justifyContent: 'center',
		alignItems: 'center',
		color: 'black',
	},
	formStyle: {
		justifyContent: 'center',
		flex: 1
	},
	inputs: {
		marginTop: 10,
		marginBottom: 20,
	},
	button: {
		borderRadius: 3,
		color: 'white',
		marginBottom: 10,
	},
	inputContainer: {
		padding: 10,
		borderWidth: 1,
		borderBottomColor: '#CCC',
		borderColor: 'white',
		backgroundColor: '#FFF',
	},
	input: {
		height: 40,
		fontSize: 14
	},
	whiteFont: {
		color: '#FFF'
	}
});


module.exports = Login;