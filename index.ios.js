/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
'use strict';
import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  ScrollView,
  View,
  Animated,
  Navigator,
  TouchableHighlight,
  StatusBarIOS,
} from 'react-native';

import _ from 'lodash';

import TitleBar, { TITLE_BAR_HEIGHT } from './app/components/TitleBar';
import ShowView from './app/components/ShowView';

const api = (path) => `https://tv-api.9now.com.au/v1/${path}?device=react-native`

StatusBarIOS.setStyle(1);

class NewVod extends Component {

  constructor(...args) {
    super(...args);
    this.state = {
      shows: null,
      activeShow: null,
      openVal: new Animated.Value(0),
      dismissVal: new Animated.Value(0),
      scrollOffset: TITLE_BAR_HEIGHT * -1,
    };
  }

  fetchData() {
    fetch(api('pages/home'))
      .then(resp => resp.json())
      .then((data) => {
        const shows = _.chain(data.items)
          .map(item => item.items)
          .flatten()
          .filter(item => item.type === 'tv-series')
          .uniqBy(item => item.slug)
          .value();

        this.setState({ shows });
      });
  }

  componentDidMount() {
    this.fetchData();
  }

  restLayouts = {};

  springConfig: {tension: 200, friction: 15};

  onLayout = (e) => {
    this.setState({layout: e.nativeEvent.layout});
  };

  onCardLayout = (...args) => {
  };


  // It's probably not the best that we're mutating the show object.
  // That's the reason why we need to call forceUpdate :/

  onCardOpen(show) {
    console.log('onCardOpen', show.name);
    show.isActive = true;

    this.setState({
      activeShow: show,
      activeCardInitialLayout: this.restLayouts[show.slug],
    }, () => {
      Animated.spring(this.state.openVal, {toValue: 1, ...this.springConfig}).start(() => {
        this.onCardOpened(show);
      });
    });
  };

  onCardOpened(show) {
    console.log('onCardOpened', show.name);
  }

  onCardDismiss(show) {
    console.log('onCardDismiss', show.name);
    show.isActive = false;
    this.forceUpdate(); // force the update (to remove) the full Show View component

    requestAnimationFrame(() => {
      this.setState({
        activeShow: null,
        activeCardInitialLayout: null,
      }, () => {
        this.onCardDismissed(show);
      });
    })
  }

  onCardDismissed(show) {
    console.log('onCardDismissed', show.name);
  }

  renderLoading() {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          Loading...
        </Text>
      </View>
    );
  }

  onScroll = (e) => {
    this.setState({
      scrollOffset: e.nativeEvent.contentOffset.y
    });
  };

  render() {
    const { shows, activeShow, openVal, dismissVal } = this.state;
    let activeCard;

    if (!shows) {
      return this.renderLoading();
    }

    const cards = shows.map((show) => {
      const onLayout = (e) => {
        const layout = e.nativeEvent.layout;
        this.restLayouts[show.slug] = layout;
      }

      return (
        <ShowView
          {...show}
          isCard
          isDummy={show.isActive}
          key={show.slug}
          onCardOpen={this.onCardOpen.bind(this, show)}
          onLayout={onLayout}
        />
      );
    });

    return (
      <Animated.View style={styles.container} onLayout={this.onLayout}>
        <ScrollView
          scrollEventThrottle={32}
          onScroll={this.onScroll}
          style={styles.scroller}
          contentInset={{top: TITLE_BAR_HEIGHT}}
          contentOffset={{y: TITLE_BAR_HEIGHT * -1}}
        >
          <View style={styles.showContainer}>
            {cards}
          </View>
        </ScrollView>

        <TitleBar>{this.state.shows.length} Shows</TitleBar>

        {activeShow && (
          <ShowView
            {...activeShow}
            openVal={openVal}
            dismissVal={dismissVal}
            key={'active'}
            scrollOffset={this.state.scrollOffset}
            restLayout={this.state.activeCardInitialLayout}
            onCardDismiss={this.onCardDismiss.bind(this, activeShow)}
            onCardDismissed={this.onCardDismissed.bind(this, activeShow)}
            containerLayout={this.state.layout} />
        )}
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    fontSize: 20,
    textAlign: 'center',
    color: 'white',
    marginBottom: 5,
  },

  showContainer: {
    flex: 1,
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
});

AppRegistry.registerComponent('NewVod', () => NewVod);
