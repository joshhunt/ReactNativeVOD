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

  onLayout = (e) => {
    this.setState({layout: e.nativeEvent.layout});
  };

  onCardLayout = (...args) => {
  };

  onCardSelect(show) {
    var config = {tension: 300, friction: 20};

    if (show.isActive) {
      show.isActive = false;
      Animated.spring(this.state.openVal, {toValue: 0, ...config}).start(() => {
        this.setState({
          activeShow: null,
          activeCardInitialLayout: null,
        });
      });
    } else {
      show.isActive = true;

      this.setState({
        activeShow: show,
        activeCardInitialLayout: this.restLayouts[show.slug],
      }, () => {
        Animated.spring(this.state.openVal, {toValue: 1, ...config}).start();
      });
    }

  };

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
    const { shows, activeShow, openVal } = this.state;
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
          key={show.slug}
          onSelected={this.onCardSelect.bind(this, show)}
          onLayout={onLayout}
        />
      );
    })

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
            key={'active'}
            scrollOffset={this.state.scrollOffset}
            onSelected={this.onCardSelect.bind(this, activeShow)}
            restLayout={this.state.activeCardInitialLayout}
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
