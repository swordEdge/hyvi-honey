'use strict';
var React = require('react-native');
var Button = require('react-native-button');
var Actions = require('react-native-router-flux').Actions;
var Parse = require('parse/react-native');
var ParseReact = require('parse-react/react-native');
var ParseComponent = ParseReact.Component(React);
import Global from './Global';
import NavigationBar from 'react-native-navbar';
var {AudioRecorder, AudioPlayer} = require('react-native-audio');
var RNUploader = require('../lib/react-native-uploader-s3/Uploader')
var xml2json = require('node-xml2json');
var s3_policy = require('../lib/react-native-uploader-s3/s3_policy');
var RNFS = require('react-native-fs');
var { Icon, } = require('react-native-item-checkbox');

var tagImg = require('../res/tag.png');

let s3_opts = {
  bucket: 'hyvi-honeypot',
  region: 'eu-west-1',
  key: 'AKIAJYYHDJ3IL55Z5AXA',
  secret: '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',
  acl: 'public-read',
  expires: new Date(Date.now() + (24 * 60 * 60 * 1000)),
  length: 10485760, // 10M as maximal size
};

var {
	Modal,
	StyleSheet,
	View,
	TextInput,
	Image,
	Text,
} = React;

var fileURI = 'temp.caf';

class NewRecord extends ParseComponent {
	constructor(props) {
		super(props);
		this.state = {
			currentTime: 0.0,
			recording: false,
			finished: false,
			uploading: false,
			isModalOpen: false,
			tags: [],
			tagText: '',
		};
		console.log('PROPS: ', props.channelId);
		this.recordId = null;
		this.recDuration = 0;
	}

	observe(props, state) {

		return {
			channel: (new Parse.Query('Channel')).equalTo('objectId', props.channelId),
		}
	}

	componentDidMount() {
		AudioRecorder.prepareRecordingAtPath(fileURI);
		AudioRecorder.onProgress = (data) => {
			this.setState({currentTime: Math.floor(data.currentTime)});
		};
		AudioRecorder.onFinished = (data) => {
			this.setState({finished: data.finished});
			// console.log('Finished recording: ', data);
			this._uploadFile();
		};
	}

	_record () {
		if(this.recordId) {
			alert('You have already saved your record.');
			return;
		}
		if(!this.state.recording) {
			AudioRecorder.startRecording();
			this.setState({recording: true});
		} else {
			AudioRecorder.stopRecording();
			this.setState({recording: false});
			// AudioRecorder.playRecording();
			console.log('Record finished: ', this.state.currentTime);
			this.recDuration = Math.floor(this.state.currentTime);
			// this._uploadFile();
		}
	}

	generateFilename(length) {
	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";

	    for( var i=0; i < length; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));

	    return text;
	}

	_uploadFile() {
		var that = this;
		let p = s3_policy(s3_opts);
		var fileName = this.generateFilename(10) + '.caf';
		var path = RNFS.DocumentDirectoryPath + '/' + fileURI;
		let opts = {
	      	url: 'https://' + s3_opts.bucket + '.s3.amazonaws.com/',
	      	files: [
      			{
      				name: 'file',
	      			filename: fileName,
	      			filepath: path,
	      		}
	      	],
	      	params: {
	      		'Content-Type': 'audio/caf',
	      		key: 'audio/' + fileName,
		        acl: s3_opts.acl,
		        'X-Amz-Signature': p.signature,
		        'x-amz-credential': p.credential,
		        'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
		        'X-Amz-Date': p.date + 'T000000Z',
		        'policy': p.policy,
		        'success_action_status': '201',
				'x-amz-meta-uuid': '14365123651274'
	      	}
	    };
	    RNUploader.upload( opts, ( err, res )=>{
	      	if( err ){
	        	console.log('Upload Error: ', err);
	          	this.setState( { uploading: false, uploadStatus: err } );
	          	return;
	      	}

	      	let status = res.status;
	      	let responseJson = xml2json.parser( res.data );

	      	// console.log('upload complete with status: ' + status);
	      	console.log('Upload suceeded: ', responseJson );
	      	if(responseJson.hasOwnProperty('postresponse')) {
	      		that._saveToParse(responseJson.postresponse.location);
	      	}
	      	this.setState( { uploading: false, uploadStatus: status } );
	    });
	}

	_saveToParse(url) {
		var that = this;
		ParseReact.Mutation.Create('Record', {
            channelId: {
                    '__type': 'Pointer',
                    'className': 'Channel',
                    'objectId': this.props.channelId,
                },
            recorder: {
                    '__type': 'Pointer',
                    'className': '_User',
                    'objectId': Global.currentUser.id,
                },
            fileURL: url,
            tags: this.state.tags,
            duration: this.recDuration,
        })
        .dispatch()
        .then(function(object) {
        	that.recordId = object.id;
        	alert('Record has been saved successfully');
        });
	}

	getUserImages() {
		var titleView = new Array();
		// titleView.push(<View style={styles.title}>);
		if(this.data.channel.length > 0) {

			var parseObj = new Parse.Query(Parse.User);
			parseObj.containedIn('objectId', this.data.channel[0].members);

			parseObj.find().then(function(results) {
			  	// each of results will only have the selected fields available.
			  	titleView = results.map(function(user) {
			  		var url = '';
		  			var profileImage = user.get('profileImage');
		  			if(profileImage) {
						url = profileImage._url;
					}
					console.log('PROFILE IMAGE: ', profileImage);
					return ((<Image tyle={styles.profileImage} source={{uri: url}}></Image>));
			  	});
			});
		}
		// titleView.push(</View>);
		console.log('Title is ', titleView);
		return titleView;
	}

	render(){
		var btnStyle = (this.state.recording) ? styles.btnRecordingStyle : styles.btnNormalStyle;
		const leftButtonConfig = {
			title: '<-',
			handler: function () {
				Actions.pop();
			},
		};
		const rightButtonConfig = {
			title: '',
			handler: function () {
			},
			type: 'flagIcon',
		};

		var titleString = this.getUserImages();
		console.log('rendering:', titleString);
		
		const titleConfig = {
			title: 'New Record',
			// type: 'view',
		};

		// Generate tag string
        var tagStr ='';
        for (var i = 0; i < this.state.tags.length; i++) {
            var totalLen = tagStr.length;
            totalLen += this.state.tags[i].length;
            if ( totalLen > 30 ) {
                tagStr += '...';
                break;
            }
            tagStr += '#' + this.state.tags[i] + ' ';
        }

		return (
			<View style={{flex: 1}}>
				<NavigationBar
					title={titleConfig}
					leftButton={leftButtonConfig}
					rightButton={rightButtonConfig} />
				<View style={styles.container}>
					<View style={styles.mainArea}>
						<View style={styles.recBtn}>
							<Button onPress= {() => this._record()}>
								<Image style={[styles.btnCenter, btnStyle]}></Image>
							</Button>
						</View>
					</View>
					<View style={styles.bottomArea}>
						<Button onPress={()=>this.openModal()}>
                            <Icon
		                        name='ion|ios-pricetag'
		                        size={ 30 }
		                        color='#204FC1'
		                        style={styles.tagBtn} />
                        </Button>
                        <View style={styles.tagContainer}>
                        	<Text style={styles.tagTextStyle}>{tagStr}</Text>
                        </View>
					</View>
				</View>
				<Modal 
					animated={true}
			        transparent={true}
			        visible={this.state.isModalOpen}>
			        <View style={styles.modalContainer}>
			        	<View style={styles.modalArea}>
				          	<Text>Add Tag</Text>
				          	<View style={styles.inputContainer}>
					          	<TextInput 
									style={styles.input}
									placeholder="tag name"
									value={this.state.tagText}
									onChangeText={text => this.setState({tagText: text})}
								/>
							</View>
							<Button onPress={() => this.closeModal()}>Add</Button>
						</View>
					</View>
		        </Modal>
			</View>
		);
	}

	openModal = () => {
		this.setState({isModalOpen: true});
	};

	closeModal = () => {
		this.state.tags.push(this.state.tagText);
		if(this.recordId) {
			ParseReact.Mutation.Add(this.recordId, 'tags', this.state.tagText).dispatch();
		}
		this.setState({tagText: ''});
		this.setState({isModalOpen: false});
	};
}

var BUTTON_SIZE = 80;
var PIC_SIZE = 40;
var PIC_MARGIN = 3;
var styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#F6F4EE',
		padding: 20
	},
	title: {
		flexDirection: 'row',
	},
	channelItem: {
		width: PIC_SIZE,
		height: PIC_SIZE,
		borderRadius: PIC_SIZE/2,
		borderWidth: 1,
		margin: PIC_MARGIN,
		borderColor: '#EEE',
		justifyContent: 'center',
		alignItems: 'center',
	},
	mainArea: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	btnCenter: {
		width: BUTTON_SIZE,
		height: BUTTON_SIZE,
		borderWidth: 4,
		borderColor: 'white',
		borderRadius: BUTTON_SIZE/2,
	},
	btnNormalStyle: {
		backgroundColor: '#204FC1',
	},
	btnRecordingStyle: {
		backgroundColor: '#ED2E09',
	},
	bottomArea: {
		flex: 0.1,
		alignItems: 'flex-end',
		flexDirection: 'row',
		margin: 20,
	},
	tagBtn: {
        // width: 30,
        // height: 30,
    },
    tagContainer: {
    	marginLeft: 20,
    },
    tagTextStyle: {
        color: '#9E9B96',
    },

    modalContainer: {
    	flex: 1,
    	// alignItems: 'center',
    	justifyContent: 'center',
    },
    modalArea: {
    	backgroundColor: 'white',
    	padding: 20,
    	margin: 20,
    },

    inputContainer: {
		borderWidth: 1,
		borderBottomColor: '#CCC',
		borderColor: 'white',
		marginTop: 20,
		marginBottom: 10,
    },

    input: {
		height: 40,
		fontSize: 14,
	},
});


module.exports = NewRecord;