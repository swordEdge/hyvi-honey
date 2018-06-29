'use strict';

var React = require('react-native');
var {View, Text, StyleSheet, Image, TextInput} = React;
var Button = require('react-native-button');
var Actions = require('react-native-router-flux').Actions;
var Parse = require('parse/react-native');
var ParseReact = require('parse-react/react-native');
var ParseComponent = ParseReact.Component(React);
import NavigationBar from 'react-native-navbar';
import Global from './Global';

class Profile extends ParseComponent {
    constructor(props) {
        super(props);
        this.state = {
            values: {
                oldPass: '',
                newPass: '',
                passConfirm: '',
            },
        };
        
    }

    observe(props, state) {
        return {
            user: ParseReact.currentUser
        };
    }

    render() {
        const leftButtonConfig = {
            title: '<-',
            handler: function () {
                Actions.pop();
            },
        };
        const titleConfig = {
            title: 'Profile',
        };
        var profileImageUrl = '';
        if(this.data.user.hasOwnProperty('profileImage')) {
            profileImageUrl = this.data.user.profileImage._url;
        }
        return (
            <View style={{flex: 1}}>
                <NavigationBar
                    title={titleConfig}
                    leftButton={leftButtonConfig} />
                <View style={styles.container}>
                    <View style={styles.subItemsList}>
                        <View style={styles.imgArea}>
                            <Image 
                                style={[styles.profileImage, styles.mb20]} 
                                resizeMode='cover'
                                source={{uri: profileImageUrl}}>
                            </Image>
                        </View>
                        <View style={styles.inputs}>
                            <View style={[styles.textContainer, styles.mb20]}>
                                <Text>{this.data.user.fullname}</Text>
                            </View>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    password={true}
                                    style={styles.input}
                                    placeholder="Last Pasword"
                                    value={this.state.values.oldPass}
                                    onChangeText={text => this.setState({
                                        values: {
                                            oldPass: text,
                                            newPass: this.state.values.newPass,
                                            passConfirm: this.state.values.passConfirm
                                        }
                                    })}
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    password={true}
                                    style={styles.input}
                                    placeholder="Pasword (8+ characters)"
                                    value={this.state.values.newPass}
                                    onChangeText={text => this.setState({
                                        values: {
                                            newPass: text,
                                            oldPass: this.state.values.oldPass,
                                            passConfirm: this.state.values.passConfirm
                                        }
                                    })}
                                />
                            </View>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    password={true}
                                    style={styles.input}
                                    placeholder="Pasword (8+ characters)"
                                    value={this.state.values.passConfirm}
                                    onChangeText={text => this.setState({
                                        values: {
                                            passConfirm: text,
                                            newPass: this.state.values.newPass,
                                            oldPass: this.state.values.oldPass
                                        }
                                    })}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.bottomArea}>
                        <Button style={styles.saveBtn} onPress={()=>this._resetPassword()}>SAVE</Button>
                    </View>
                </View>
            </View>
        );
    }

    _resetPassword = () => {
        var that = this;
        if(this.state.values.newPass != this.state.values.passConfirm) {
            alert('Password do not match. Please enter again.');
            this.setState({
                values: {
                    newPass: '',
                    passConfirm: '',
                }
            });
        }
        Parse.User.logIn(this.data.user.email, this.state.values.oldPass, {
            success: function(user) {
                console.log('login success');
                Parse.User.current().fetch().then(function(fetchedUser) {
                    console.log('User fetched:', fetchedUser);
                    fetchedUser.setPassword(that.state.values.newPass);
                    fetchedUser.save()
                    .then(
                        function(user) {
                            console.log('Password changed', user);
                            alert('Your password has been successfully updated.');
                            Actions.pop();
                        },
                        function(error) {
                            alert('Something went wrong', error);
                        }
                    );
                });
            },
            error: function(user, error) {
                console.log('login error: ', user, error);
                alert('Incorrect current password');
            }
        });
    };
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F4EE',
        padding: 30,
        justifyContent: 'center',
    },

    subItemsList: {
        flex: 1,
        marginTop: 70,
    },
    imgArea: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileImage: {
        margin: 20,
        borderWidth: 1,
        borderColor: 'black',
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    inputs: {
        marginTop: 10,
        marginBottom: 20,
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

    greyText: {
        color: '#555',
    },

    mb20: {
        marginBottom: 20,
    },

    bottomArea: {
        flex: 0.1,
        // justifyContent: 'flex-end',
        // alignItems: 'flex-end'
        alignItems: 'stretch',
    },
    saveBtn: {
        padding: 15,
        backgroundColor: '#436185',
        color: '#FFF',
        borderRadius: 5,
        width: null,
    },
    greyText: {
        color: '#555',
    },
});

module.exports = Profile;
