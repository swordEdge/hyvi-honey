'use strict';

var React = require('react-native');
var {View, Text, StyleSheet} = React;
var Actions = require('react-native-router-flux').Actions;
import NavigationBar from 'react-native-navbar';

class About extends React.Component {
    render(){
        const leftButtonConfig = {
            title: '<-',
            handler: function () {
                Actions.pop();
            },
        };
        const titleConfig = {
            title: 'Privacy',
        };
        return (
            <View style={{flex: 1}}>
                <NavigationBar
                    title={titleConfig}
                    leftButton={leftButtonConfig} />
                <View style={styles.container}>
                    <Text style={styles.txtTitle}>Privacy</Text>
                    <Text style={styles.txtContent}>
                        Banjo tote bag bicycle rights, High Life sartorial cray craft beer whatever street art fap.
                        Hashtag typewriter banh mi, squid keffiyeh High Life Brooklyn twee craft beer tousled chillwave. {'\n'}
                        PBR&B selfies chillwave, bespoke tote bag blog post-ironic. 
                        Single-origin coffee put a bird on it craft beer YOLO, Portland hella deep v Schlitz.
                    </Text>
                </View>
            </View>
        );
    }
}

var styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F4EE',
        padding: 40,
    },
    txtTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'left',
    },
    txtContent: {
        marginTop: 10,
        textAlign: 'left',
    },
});

module.exports = About;
