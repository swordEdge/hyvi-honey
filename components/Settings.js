'use strict';

var React = require('react-native');
var {View, Text, StyleSheet, Image, Navigator} = React;
var Button = require('react-native-button');
var Actions = require('react-native-router-flux').Actions;
var Parse = require('parse/react-native');
var ParseReact = require('parse-react/react-native');
var ParseComponent = ParseReact.Component(React);
var channelImg = require('../res/channel-inactive.png');

import NavigationBar from 'react-native-navbar';

class Settings extends ParseComponent {
    constructor(props) {
        super(props);
        this.state = {
        };

    }

    observe(props, state) {
        return {
            user: ParseReact.currentUser
        };
    }

    render(){
        const rightButtonConfig = {
            title: 'LogOut',
            handler: function () {
                Parse.User.logOut();
                Actions.login();
            },
        };

        const titleConfig = {
            title: 'Settings',
        };
        // console.log('current user: ', this.data.user);
        var profileImageUrl = '';
        if(this.data.user.hasOwnProperty('profileImage')) {
            profileImageUrl = this.data.user.profileImage._url;
        }
        return (
            <View style={{flex: 1}}>
                <NavigationBar
                    title={titleConfig}
                    rightButton={rightButtonConfig} />
                <View style={styles.container}>
                    <View style={styles.topArea}>
                        <Image 
                            style={styles.profileImage} 
                            resizeMode='cover'
                            source={{uri: profileImageUrl}}>
                        </Image>
                        <Text style={[styles.profileTitle, styles.greyText]}>{this.data.user.fullname}</Text>
                    </View>
                    <View style={styles.subItemsList}>
                        <View style={styles.subItem}>
                            <Button style={styles.itemButton} onPress={Actions.settingsProfile}>
                                <Text style={[styles.itemText, styles.greyText]}>Your Profile</Text>
                                <Text style={[styles.itemIcon, styles.greyText]}>-></Text>
                            </Button>
                        </View>
                        <View style={styles.subItem}>
                            <Button style={styles.itemButton} onPress={Actions.settingsNotification}>
                                <Text style={[styles.itemText, styles.greyText]}>Notification</Text>
                                <Text style={[styles.itemIcon, styles.greyText]}>-></Text>
                            </Button>
                        </View>
                        <View style={styles.subItem}>
                            <Button style={styles.itemButton} onPress={Actions.settingsPrivacy}>
                                <Text style={[styles.itemText, styles.greyText]}>Privacy</Text>
                                <Text style={[styles.itemIcon, styles.greyText]}>-></Text>
                            </Button>
                        </View>
                        <View style={styles.subItem}>
                            <Button style={[styles.lastItem, styles.itemButton]} onPress={Actions.settingsAbout}>
                                <Text style={[styles.itemText, styles.greyText]}>About</Text>
                                <Text style={[styles.itemIcon, styles.greyText]}>-></Text>
                            </Button>
                        </View>
                    </View>
                    <View style={styles.bottomArea}>
                        <Button onPress={Actions.channels_overview}>
                            <Image style={styles.channelsBtn} source={channelImg} resizeMode='cover'></Image>
                        </Button>
                        <View style={styles.gapFill}></View>
                        <Image 
                            style={styles.smallImg}
                            source={{uri: profileImageUrl}}>
                        </Image>
                    </View>
                </View>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch',
        backgroundColor: '#F6F4EE',
        padding: 20,
    },

    topArea: {
        flex: 0.3,
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    subItemsList: {
        flex: 0.5,
        justifyContent: 'center',
    },
    profileImage: {
        margin: 20,
        borderWidth: 1,
        borderColor: 'black',
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    profileTitle: {
        fontSize: 18,
    },
    subItem: {
        padding: 20,
        borderWidth: 1,
        borderBottomColor: '#CCC',
        borderColor: '#FFF',
        backgroundColor: '#FFF',
    },
    lastItem: {
        borderBottomColor: '#FFF',
    },
    itemButton: {
        
    },
    itemText: {
        flex: 1,
    },
    itemIcon: {
        flex: 0.1,
    },

    bottomArea: {
        flex: 0.1,
        //justifyContent: 'flex-end',
        alignItems: 'flex-end',
        flexDirection: 'row',
    },
    channelsBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },
    gapFill: {
        flex: 1,
    },
    smallImg: {
        width: 30,
        height: 30,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 15,
    },

    greyText: {
        color: '#555',
    },
});

module.exports = Settings;
