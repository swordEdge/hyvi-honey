'use strict';
var React = require('react-native');
var Button = require('react-native-button');
var Actions = require('react-native-router-flux').Actions;
var Parse = require('parse/react-native');
var ParseReact = require('parse-react/react-native');
var FBLoginManager = require('NativeModules').FBLoginManager;

var {
    StyleSheet,
    View,
    TextInput,
    Text,
} = React;

class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: {
                email: '',
                password: ''
            }
        };
    }

    observe(props, state) {
        return {
            user: null
        };
    }

    validate() {

        var success = true;
        var state = this.state.value;
        for(var key in state){;

            if(state[key].length <= 0){
                success = false;
            }
        }
        
        if(success) {
            Actions.register2(this.state);
        } else {

        }
    }

    onFBSignUp() {
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

    render(){
        return (
            <View style={styles.container}>
                <View style={styles.title}>
                    <Text style={styles.titleText}>Sign up</Text>
                </View>
                <View style={styles.formStyle}>
                    <View style={styles.inputs}>
                        <View style={styles.textContainer}>
                            <Text>Choose a username</Text>
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput 
                                style={styles.input}
                                placeholder="Email"
                                value={this.state.value.email}
                                onChangeText={text => this.setState({
                                    value:{email: text, password: this.state.value.password}
                                })}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <TextInput
                                password={true}
                                style={styles.input}
                                placeholder="Pasword (8+ characters)"
                                value={this.state.value.password}
                                onChangeText={text => this.setState({
                                    value:{password: text, email: this.state.value.email}
                                })}
                            />
                        </View>
                    </View>
                    <Button style={[styles.continueBtn, styles.whiteFont, styles.button]} onPress={this.validate.bind(this)}>
                        CONTINUE
                    </Button>
                    <Button style={[styles.fblogin, styles.whiteFont, styles.button]} onPress={()=>this.onFBSignUp()}>
                        SIGN UP WITH FACEBOOK
                    </Button>
                </View>
                
                <Button style={styles.signup} onPress={Actions.login}>
                    Already have an account?
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
    continueBtn: {
        backgroundColor: '#EC2E09',
        padding: 20,
    },
    fblogin: {
        backgroundColor: '#3B4D8F',
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        padding: 20,
        paddingLeft: 10,
        borderWidth: 1,
        borderBottomColor: '#CCC',
        borderColor: 'white',
        backgroundColor: '#FFF',
        justifyContent: 'center',
        
    },
    input: {
        fontSize: 14,
        height: 40,
    },
    whiteFont: {
        color: '#FFF'
    }
});

module.exports = Register;
