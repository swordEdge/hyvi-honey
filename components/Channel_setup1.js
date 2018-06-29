'use strict';
var React = require('react-native');
var Button = require('react-native-button');
var Actions = require('react-native-router-flux').Actions;
var Parse = require('parse/react-native');
var ParseReact = require('parse-react/react-native');
import NavigationBar from 'react-native-navbar';

var {
    StyleSheet,
    View,
    Text,
    TextInput,
} = React;

class ChannelSetup1 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: {
                channelName: '',
            }
        };
        // Parse.initialize(CONFIG.PARSE.APP_ID, CONFIG.PARSE.JAVASCRIPT_KEY);
    }

    render(){
        var parent = this;
        const leftButtonConfig = {
            title: '<-',
            handler: function () {
                Actions.pop();
            },
        };
        const rightButtonConfig = {
            title: 'Next',
            handler: function () {
                Actions.channelSetup2(parent.state.value);
            },
        };

        const titleConfig = {
            title: 'Channels',
        };
        return (
            <View style={{flex: 1}}>
                <NavigationBar
                    title={titleConfig}
                    rightButton={rightButtonConfig}
                    leftButton={leftButtonConfig} />
                <View style={styles.container}>
                    <View style={styles.inputContainer}>
                        <TextInput 
                            style={styles.input}
                            placeholder="Name Your Channel"
                            value={this.state.channelName}
                            onChangeText={text => this.setState({value: {channelName: text}})}
                        />
                    </View>
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
});

module.exports = ChannelSetup1;
