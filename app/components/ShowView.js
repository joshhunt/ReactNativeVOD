'use strict';

import React, {
  Component,
  StyleSheet,
  ScrollView,
  View,
  Image,
  Animated,
  Dimensions,
} from 'react-native';

const dimensions = Dimensions.get('window');
import { TITLE_BAR_HEIGHT } from './TitleBar';


const imageGutter = 1;
const imageWidth = (dimensions.width / 2) - (imageGutter / 2);

const _styles = {
  card: {
    width: imageWidth,
    height: (imageWidth) * (9/16),
    paddingBottom: imageGutter / 2,
    backgroundColor: 'black',
  },

  activeCard: {
    position: 'absolute',
    top: 0,
    left: 0,
  },

  image: { flex: 1 }
};

const styles = StyleSheet.create(_styles);


export default class ShowCard extends Component {

  constructor(...args) {
    super(...args);

    this.state = {
      fadeAnim: new Animated.Value(0),
    }
  }

  onImageLoaded = () => {
    Animated.timing(
      this.state.fadeAnim,
      { toValue: 1 },
    ).start();
  };

  render() {
    const { image, isCard, containerLayout, restLayout, onLayout, openVal } = this.props;
    const isActive = !isCard;

    const rootProps = {
      onLayout,

      style: [
        styles.card,
        isCard && { opacity: this.state.fadeAnim },
        isActive && styles.activeCard,
        isActive && {
          left:   openVal.interpolate({inputRange: [0, 1], outputRange: [restLayout.x, 0]}),
          top:    openVal.interpolate({inputRange: [0, 1], outputRange: [restLayout.y - this.props.scrollOffset, 0]}),
          width:  openVal.interpolate({inputRange: [0, 1], outputRange: [_styles.card.width, containerLayout.width]}),
          height: openVal.interpolate({inputRange: [0, 1], outputRange: [_styles.card.height, containerLayout.height]}),
          backgroundColor: openVal.interpolate({inputRange: [0, 1], outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 1)']}),
        },
      ],

      onStartShouldSetResponder: () => true,

      // On touch up
      onResponderRelease: () => {
        const { onSelected } = this.props;
        onSelected && this.props.onSelected();
      }
    }

    const imageStyles = [
      styles.image,
      isActive && {
        flex: 0,
        width:  openVal.interpolate({inputRange: [0, 1], outputRange: [restLayout.width, containerLayout.width]}),
        height: openVal.interpolate({inputRange: [0, 1], outputRange: [restLayout.width * (9/16), containerLayout.width * (9/16)]}),
      }
    ]

    return (
      <Animated.View {...rootProps} >
        {/* ((isCard && !this.props.isActive) || isActive ) && (
          <Animated.Image source={{uri: image.sizes.w768}}
            onLoadEnd={this.onImageLoaded}
            style={imageStyles}
          />
        )*/}
        <Animated.Image source={{uri: image.sizes.w768}}
          onLoadEnd={this.onImageLoaded}
          style={imageStyles}
        />
      </Animated.View>
    );
  }
}