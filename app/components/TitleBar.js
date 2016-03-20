import React, {
  Component,
  StyleSheet,
  Text
} from 'react-native';

const { BlurView } = require('react-native-blur');

export default class TitleBar extends Component {
  render() {
    return (
      <BlurView blurType="dark" blurStyle="dark" style={styles.titleBar}>
        <Text style={styles.title}>{this.props.children}</Text>
      </BlurView>
    );
  }
}

const _styles = {
  // 54px =
  titleBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 34,
    paddingBottom: 12,
  },

  title: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'System',
    fontWeight: '600',
    lineHeight: 18,
  },

}

const styles = StyleSheet.create(_styles);
export const TITLE_BAR_HEIGHT = _styles.titleBar.paddingTop + _styles.titleBar.paddingBottom + _styles.title.lineHeight;

console.log('TITLE_BAR_HEIGHT:', TITLE_BAR_HEIGHT);
