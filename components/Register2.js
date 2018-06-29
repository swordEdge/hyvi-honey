'use strict';
var React = require('react-native');
var Button = require('react-native-button');
var Actions = require('react-native-router-flux').Actions;
var Parse = require('parse/react-native');
var ParseReact = require('parse-react/react-native');
import Global from './Global';

var {
    StyleSheet,
    View,
    Text,
    TextInput,
} = React;

class Register2 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: {
                fullname: '',
            }
        };
        // Parse.initialize(CONFIG.PARSE.APP_ID, CONFIG.PARSE.JAVASCRIPT_KEY);
    }

    checkSignup() {
        var success = true;
        var state = this.state.value;
        for(var key in state){;
            console.log(key + ": " + state[key]);
            if(state[key].length <= 0){
                success = false;
            }
        }
        if(success) {
            this._register();
        } else {
            //show alert
            // AlertIOS.alert('Error','Please complete all fields',
           //   [{text: 'Okay', onPress: () => console.log('')}]
            // );
        }
    }

    _register() {
        var that = this;
        console.log("PROPS: ", this.props.value);
        var u = new Parse.User({
            username: this.props.value.email,
            email: this.props.value.email,
            password: this.props.value.password,
            fullname: this.state.value.fullname,
            sound: false,
            vibration: false,
            feedback: false,
            message: false,
            friend_request: false
        });

        u.signUp(null, {
            success: function(user) {

                console.log('SignUp Success: ', user);
                Global.currentUser = user;
                Actions.settings();
            }, 
            error: function(user, err) {
                console.log('Signup Error: ', user, err);
                alert('Signup failed: ', JSON.stringify(err));
            }
        });
    }

    render(){
        return (
            <View style={styles.container}>
                <View style={styles.title}>
                    <Text style={styles.titleText}>Sign up</Text>
                </View>
                <View style={styles.formStyle}>
                    <View style={styles.imageView}>
                        <View style={styles.imageArea}>
                            <Text style={styles.largeFont}>+</Text>
                        </View>
                    </View>
                    <View style={styles.inputs}>
                        <View style={styles.inputContainer}>
                            <TextInput 
                                style={styles.input}
                                placeholder="What's your full name?"
                                value={this.state.fullname}
                                onChangeText={text => this.setState({
                                    value: {
                                        fullname: text,
                                    }
                                })}
                            />
                        </View>
                    </View>
                    <Button style={[styles.continueBtn, styles.whiteFont, styles.button]} onPress={this.checkSignup.bind(this)}>
                        DONE
                    </Button>
                </View>
                <View style={styles.bottomText}>
                    <Text style={styles.greyColor}>By creating an account, you accpet our</Text>
                    <Button style={styles.blackColor} onPress={Actions.pop}>
                        Terms of Service
                    </Button>
                </View>
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
    bottomText: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    formStyle: {
        marginTop: 100,
        // alignItems: 'flex-start',
        // justifyContent: 'center',

        flex: 1
    },
    imageView: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageArea: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 20,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
    },
    largeFont: {
        fontSize: 48,
        // fontWeight: 'bold',
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
    greyColor: {
        color: 'grey'
    },
    blackColor: {
        color: 'black'
    },
    whiteFont: {
        color: '#FFF'
    }
});

module.exports = Register2;
