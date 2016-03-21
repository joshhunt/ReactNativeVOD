'use strict';

import React, {
  Component,
  StyleSheet,
  ScrollView,
  View,
  PanResponder,
  Text,
  Image,
  Easing,
  Animated,
  Dimensions,
} from 'react-native';

const dimensions = Dimensions.get('window');
import { TITLE_BAR_HEIGHT } from './TitleBar';


const imageGutter = StyleSheet.hairlineWidth;
const imageWidth = (dimensions.width / 2) - (imageGutter / 2);

const _styles = {
  card: {
    width: imageWidth,
    height: (imageWidth) * (9/16),
    paddingBottom: imageGutter,
    backgroundColor: 'black',
    overflow: 'hidden',
  },

  cardInner: {
    flex: 1,
  },

  activeCard: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  title: {
    fontSize: 30,
    fontWeight: '600',
    color: 'white',
  },

  debug: {
    position: 'absolute',
    padding: 20,
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'red',
  },

  image: { flex: 1 }
};

const styles = StyleSheet.create(_styles);


export default class ShowCard extends Component {

  constructor(...args) {
    super(...args);

    this.state = {
      fadeAnim: new Animated.Value(0),
      dismissY: new Animated.Value(0),
      dismissYDrag: new Animated.Value(0),
      dismissHandlers: {},
    }
  }

  onImageLoaded = () => {
    Animated.timing(
      this.state.fadeAnim,
      { toValue: 1 },
    ).start();
  };

  lolActuallyClose = () => {
    console.log('do custom dismissing stuff');
    this.setState({isDismissing: true});
    Animated.timing(
      this.state.dismissY,
      {
        toValue: 1,
        duration: 150,
        easing: Easing.in(Easing.sin)
      },
    ).start(() => {
      this.props.onSelected();
    });
  };

  touchHandlers = {
    onStartShouldSetResponder: () => true,

    // On touch up
    onResponderRelease: () => {
      console.log('onResponderRelease');

      if (this.props.isCard) {
        this.props.onSelected();
      } else {
        lolActuallyClose();
      }
    }
  };

  componentDidMount() {
    this.setState({
      dismissHandlers: PanResponder.create({
        // Do we want to listen to pans?
        onStartShouldSetPanResponder: () => {
          console.log('asking if ShouldSetPanResponder?', !!this.props.isActive);
          return !!this.props.isActive
        },

        onPanResponderGrant: () => {
          this.setState({isDismissing: true});
          console.log('onPanResponderGrant ??? lol');

          if (!this.props.containerLayout) return

          Animated.timing(this.state.dismissY, {
            easing: (t) => t,
            duration: 1,
            toValue: this.state.dismissYDrag.interpolate({
              inputRange: [0, this.props.containerLayout.height],
              outputRange: [0, 1],
            })
          }).start();
        },

        onPanResponderMove: Animated.event(
          [null, {dy: this.state.dismissYDrag}]
        ),

        onPanResponderRelease: (e, gestureState) => {
          console.log('onPanResponderRelease', gestureState);
          if (gestureState.dy > 100) {
            // If it's moved greater than our threshold, then dismiss :)
            // this._toggleIsActive();
            console.log('touch moved beyond threshold!');
            this.lolActuallyClose();
          } else {
            console.log('touch gave up before threshold!');

            Animated.spring(this.state.dismissY, {
              toValue: 0
            }).start();
          }
        },
      })
    });
  }

  defaultProps = {
    containerLayout: {}
  };

  render() {
    const {
      image,
      name,

      isCard,
      isDummy,

      containerLayout,
      restLayout,
      openVal,

      onLayout,
    } = this.props;

    const isFullView = !isCard;
    let fullView;

    const _containerLayout = containerLayout || {};

    console.log(this.state.dismissY);

    const rootProps = {
      onLayout,
      ...this.touchHandlers,

      style: [
        styles.card,
        isCard && { opacity: this.state.fadeAnim },
        isFullView && styles.activeCard,
        (isFullView && !this.state.isDismissing) && {
          left:   openVal.interpolate({inputRange: [0, 1], outputRange: [restLayout.x, 0]}),
          top:    openVal.interpolate({inputRange: [0, 1], outputRange: [restLayout.y - this.props.scrollOffset, 0]}),
          width:  openVal.interpolate({inputRange: [0, 1], outputRange: [_styles.card.width, _containerLayout.width]}),
          height: openVal.interpolate({inputRange: [0, 1], outputRange: [_styles.card.height, _containerLayout.height]}),
          backgroundColor: openVal.interpolate({inputRange: [0, 1], outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)']}),
        },
        this.state.isDismissing && {
          top:    this.state.dismissY.interpolate({inputRange: [0, 1], outputRange: [0, _containerLayout.height]}),
        }
      ],
    }

    const imageStyles = [
      styles.image,
      isFullView && {
        flex: 0,
        width:  openVal.interpolate({inputRange: [0, 1], outputRange: [restLayout.width, _containerLayout.width]}),
        height: openVal.interpolate({inputRange: [0, 1], outputRange: [restLayout.width * (9/16), _containerLayout.width * (9/16)]}),
      }
    ]

    if (isFullView) {
      fullView = (
        <View style={{width: _containerLayout.width}}>
          <Text style={styles.title}>{name}</Text>
        </View>
      );
    }

    return (
      <Animated.View {...rootProps} >
        <Animated.View style={styles.cardInner} {...this.state.dismissHandlers.panHandlers}>
          {/* !isDummy &&
            <Animated.Image source={{uri: image.sizes.w768}}
              onLoadEnd={this.onImageLoaded}
              style={imageStyles}
            />
          */}

          <Animated.Image source={{uri: image.sizes.w768}}
            onLoadEnd={this.onImageLoaded}
            style={imageStyles}
          />

          {/* this.state.isDismissing && <View style={styles.debug}><Text>Closing...</Text></View> */}

          {fullView}
        </Animated.View>
      </Animated.View>
    );
  }
}