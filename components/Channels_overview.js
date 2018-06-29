'use strict';

var React = require('react-native');
var {View, Text, StyleSheet, Image, Modal} = React;
var Button = require('react-native-button');
var Actions = require('react-native-router-flux').Actions;
var Parse = require('parse/react-native');
var ParseReact = require('parse-react/react-native');
var ParseComponent = ParseReact.Component(React);
var channelImg = require('../res/channel-active.png');
var GridView = require('react-native-grid-view');
var { Icon, } = require('react-native-item-checkbox');
import NavigationBar from 'react-native-navbar';
import Global from './Global';
var TouchableWithoutFeedback = require('TouchableWithoutFeedback');

var CARD_MARGIN = 5;
var CARD_PADDING = 10;
var TITLE_MARGIN = 15;
var PIC_SIZE = 20;
var PIC_MARGIN = 5;

var that;

// Card component
class Channel extends ParseComponent {
	
	constructor(props) {
		super(props);
		// console.log('CHANNEL: ', props);
	}

	observe(props, state) {
		return {
			users: (new Parse.Query('_User')).containedIn('objectId', props.channelContent.members),
		};
	}

	_handlePress = (ch, isNewRecord) => {
		if(isNewRecord) {
			that.setState({isModalOpen: false});
			Actions.newRecord(this.props.channelContent.objectId);
		} else {
			Actions.channel(ch);
		}
    };

	render() {
		
		if ( this.data.users.length == 0 ) {
			return (
				<View></View>
			);
		}
		this.members = this.data.users.map(function(user) {
			if(user.hasOwnProperty('profileImage')) {
				return { url: user.profileImage._url };
			} else {
				return {url: ''};
			}
		});
		this.members.push({url: 'none'});
		// console.log('Channel Render; ', this.members);
		return (
			<TouchableWithoutFeedback onPress={()=>this._handlePress(this.props.channelContent, this.props.isNewRecord)}>
				<View style={styles.channelCard}>
					<View style={styles.cardTitle}>
						<Text>{this.props.channelContent.Caption}</Text>
					</View>
					<View style={styles.cardImages}>
						<GridView
							items={this.members}
							itemsPerRow={4}
							renderItem={this.renderItem.bind(this)}
							style={styles.listView}
							cleanGrid={true}
							align='left'
						/>
					</View>
				</View>
			</TouchableWithoutFeedback>
		);
	}

	renderItem(item) {
		// console.log('CHANNEL ITEM: ', item);
		if(item.url == 'none') {
			return (
				<Button onPress={this.goToAddMembers.bind(this)}>
					<View style={[styles.addBtn, styles.channelItem]}>
						<Icon
	                        name='ion|plus-circled'
	                        size={ PIC_SIZE }
	                        color='#204FC1'
	                        style={styles.addIcon} />
		            </View>
				</Button>
			);
		} else {
			return (
				<Image 
					style={styles.channelItem}
					source={{uri: item.url}}>
				</Image>
			);
		}
	}

	goToAddMembers() {
		Actions.addMembers(this.props.channelContent)
	};
}


// Main component
class ChannelsOverview extends ParseComponent {
	
	constructor(props) {
		super(props);
		this.state = {
			isModalOpen: false
		};
		that = this;
	}

	observe(props, state) {
		return {
			user: ParseReact.currentUser,
			channels: (new Parse.Query('Channel')).containsAll('members', [Global.currentUser.id]),
		};
	}

	//create waterfall view
	alignChannels() {
		this.leftCol = [];
		this.rightCol = [];
		var leftHeight = 0, rightHeight = 0;
		for (var key in this.data.channels) {
			var channel = this.data.channels[key];
			var imgCnt = channel.members.length + 1;
			var rowCnt = Math.ceil(imgCnt/4);
			if(channel.members.indexOf('last item') < 0)
				channel.members.push('last item');
			//calculate height of card
			var cardHeight = CARD_PADDING * 2 + TITLE_MARGIN + (PIC_SIZE + PIC_MARGIN * 2) * rowCnt + CARD_MARGIN * 2;

			if ( leftHeight <= rightHeight ) {
				this.leftCol.push(this.data.channels[key]);
				leftHeight += cardHeight;
			} else {
				this.rightCol.push(this.data.channels[key]);
				rightHeight += cardHeight;
			}
		}
	}

	_chooseChannel = () => {
		this.setState({isModalOpen: true});
	};

	render(){
		// set blank url if not exist
		var profileImageUrl = '';
        if(this.data.user.hasOwnProperty('profileImage')) {
            profileImageUrl = this.data.user.profileImage._url;
        }

        // show 'Loading...' if channels are not loaded
		if (!this.data.user) {
			return (
				<View style={[{justifyContent:'center', alignItems: 'center'}, styles.container]}>
					<Text>Loading...</Text>
				</View>
			);
		}
		this.alignChannels();						// create waterfall view
		const leftButtonConfig = {
			title: 'Create',
			handler: function () {
				Actions.channelSetup1();
			},
		};
		const rightButtonConfig = {
			title: 'Search',
			handler: function () {
				var ids = that.data.channels.map(function(ch) {
	                return ch.objectId;
	            });
				Actions.search({
					channel: 'All',
					channels: ids,
				});
			},
		};
		const titleConfig = {
			title: 'Channels',
		};
		// console.log('Rendering: ', this.data.channels);
		return (
			<View style={{flex: 1}}>
				<NavigationBar
					title={titleConfig}
					rightButton={rightButtonConfig}
					leftButton={leftButtonConfig} />
				<View style={styles.container}>
					<View style={styles.channelView}>
						<View style={styles.channelCol}>
						{
							this.leftCol.map(function(channel, i) {
								return <Channel channelContent={channel} key={i} isNewRecord={false}></Channel>;
							})
						}
						</View>
						<View style={styles.channelCol}>
						{
							this.rightCol.map(function(channel, i) {
								return <Channel channelContent={channel} key={i} isNewRecord={false}></Channel>;
							})
						}
						</View>
					</View>
					<View style={styles.bottomArea}>
						<Button>
							<Image style={styles.smallImg} source={channelImg} resizeMode='cover'></Image>
						</Button>
						<View style={styles.gapFill}>
							<Button onPress={()=>this._chooseChannel()}>
								<Image style={styles.btnCenter}></Image>
							</Button>
						</View>
						<Button onPress={Actions.settings}>
							<Image 
								style={styles.smallImg}
								source={{uri: profileImageUrl}}>
							</Image>
						</Button>
					</View>
				</View>

				<Modal 
					animated={true}
			        transparent={true}
			        visible={this.state.isModalOpen}>
			        <View style={styles.modalContainer}>
			        	<View style={styles.modalTitle}>
			        		<Text style={{color: 'white'}}>Please pick a group</Text>
			        	</View>
			        	<View style={styles.channelView}>
							<View style={styles.channelCol}>
							{
								this.leftCol.map(function(channel, i) {
									return <Channel channelContent={channel} key={i} isNewRecord={true}></Channel>;
								})
							}
							</View>
							<View style={styles.channelCol}>
							{
								this.rightCol.map(function(channel, i) {
									return <Channel channelContent={channel} key={i} isNewRecord={true}></Channel>;
								})
							}
							</View>
						</View>
					</View>
		        </Modal>
			</View>
		);
	}
}

var styles = StyleSheet.create({
	container: {
		flex: 1,
		// alignItems: 'stretch',
		backgroundColor: '#F6F4EE',
		padding: 20,
	},

	channelView: {
		flexDirection: 'row',
	},

	channelCol: {
		flex: 1,
	},

	channelCard: {
		padding: CARD_PADDING,
		margin: CARD_MARGIN,
		backgroundColor: 'white',
		borderRadius: 7,
	},
	cardTitle: {
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: TITLE_MARGIN,
	},
	cardImages: {
		justifyContent: 'center',
		alignItems: 'center'
	},
	listView: {
		// alignItems: 'flex-start',
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
	bottomArea: {
		flex: 0.1,
		alignItems: 'flex-end',
		flexDirection: 'row',
		// marginBottom: CARD_MARGIN,
	},
	channelsBtn: {
		width: 30,
		height: 30,
		borderRadius: 15,
	},
	gapFill: {
		flex: 1,
		// justifyContent: 'center',
		alignItems: 'center',
	},
	btnCenter: {
		width: 60,
		height: 60,
		backgroundColor: '#204FC1',
		borderWidth: 3,
		borderColor: 'white',
		borderRadius: 30,
	},
	smallImg: {
		width: 30,
		height: 30,
		borderWidth: 1,
		borderColor: '#204FC1',
		borderRadius: 15,
	},

	greyText: {
		backgroundColor: 'grey',
	},

	addBtn: {
		backgroundColor: '#204FC1',
		justifyContent: 'center',
		alignItems: 'center',
	},

	addIcon: {
		backgroundColor: 'white',
		width: PIC_SIZE,
		height: PIC_SIZE,
	},

	modalContainer: {
    	flex: 1,
    	// alignItems: 'center',
    	// justifyContent: 'center',
    	padding: 20,
    	backgroundColor: 'rgba(0, 0, 0, 0.9)',
    	paddingTop: 70,
    },

    modalTitle: {
    	alignItems: 'center',
    	marginBottom: 20,
    },
});

module.exports = ChannelsOverview;
