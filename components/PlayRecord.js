'use strict';
var React = require('react-native');
var Button = require('react-native-button');
var Actions = require('react-native-router-flux').Actions;
var Parse = require('parse/react-native');
var ParseReact = require('parse-react/react-native');
var ParseComponent = ParseReact.Component(React);
import Global from './Global';
import NavigationBar from 'react-native-navbar';
var {AudioPlayer} = require('react-native-audio');

var {
	StyleSheet,
	View,
	TextInput,
	Image,
} = React;

class PlayRecord extends React.Component {
	constructor(props) {
		super(props);

		// initialize state params
		this.state = {
			currentTime: 0.0,
			isPlaying: false,
			finished: false,
		}
		console.log('Record PROP: ', props);

		AudioPlayer.onFinished = (data) => {
			this.setState({finished: data.finished});
			console.log('Finished playing: ', data);
			this.setState({isPlaying: false});
		};
	}

	observe(props, state) {
	}

	componentDidMount() {
		//Play audio when view loaded
		var audioURL = '';
		if (this.props.hasOwnProperty('fileURL')) {
			audioURL = this.props.fileURL;
		}
		AudioPlayer.playWithUrl(audioURL);
		this.setState({isPlaying: true});
		console.log('Playing initiated: ', audioURL);
	}

	_play () {
		if(!this.state.isPlaying) {
			this.setState({isPlaying: true});
			AudioPlayer.unpause();
		} else {
			this.setState({isPlaying: false});
			AudioPlayer.pause();
		}
	}

	render(){
		var that = this;							// save {this} instance for future use
		var btnStyle = (this.state.isPlaying) ? styles.btnPauseStyle : styles.btnPlayStyle;		// set play button style; play or pause
		
		// configure navigation bar
		const leftButtonConfig = {
			title: '<-',
			handler: function () {
				Actions.pop();
			},
		};
		const rightButtonConfig = {
			title: 'Delete',
			handler: function () {
				// delete current record from parse
				ParseReact.Mutation.Destroy(that.props.id).dispatch();
				Actions.pop();
			},
		};

		const titleConfig = {
			title: 'Details',
		};

		return (
			<View style={{flex: 1}}>
				<NavigationBar
					title={titleConfig}
					leftButton={leftButtonConfig}
					rightButton={rightButtonConfig} />
				<View style={styles.container}>
					<View style={styles.mainArea}>
						<View style={styles.playBtn}>
							<Button onPress= {() => this._play()}>
								<Image style={[styles.btnCenter, btnStyle]}></Image>
							</Button>
						</View>
					</View>
					<View style={styles.spectrumArea}>
						
					</View>
				</View>
			</View>
		);
	}
}

var styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F6F4EE',
		padding: 20
	},
	mainArea: {
		// justifyContent: 'center',
		alignItems: 'center',
	},
	btnCenter: {
		width: 60,
		height: 60,
		borderWidth: 2,
		borderColor: 'white',
		borderRadius: 30,
	},
	btnPlayStyle: {
		backgroundColor: '#204FC1',
	},
	btnPauseStyle: {
		backgroundColor: '#ED2E09',
	},
	spectrumArea: {
		// alignItems: 'flex-end',
		// flexDirection: 'row',
		margin: 20,
	},
});


module.exports = PlayRecord;