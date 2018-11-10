import React, { Component } from "react"
import {
    View,
    Animated,
    PanResponder,
    Dimensions,
    LayoutAnimation,
    UIManager
} from "react-native"

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.2;
const SWIPE_OUT_DURATION = 350;
const DIRECTION_RIGHT = 1
const DIRECTION_LEFT = -1

class Deck extends Component {
    static defaultProps = {
        onSwipeRight: () => { },
        onSwipeLeft: () => { }
    }

    constructor(props) {
        super(props);

        const position = new Animated.ValueXY();

        const panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gesture) => {
                position.setValue({ x: gesture.dx, y: 0 })
            },
            onPanResponderRelease: (event, gesture) => {
                if (gesture.dx > SWIPE_THRESHOLD * DIRECTION_RIGHT) this.forceSwipe(DIRECTION_RIGHT);
                else if (gesture.dx < SWIPE_THRESHOLD * DIRECTION_LEFT) this.forceSwipe(DIRECTION_LEFT);
                else this.resetPosition();
            }
        })

        this.state = { panResponder, position, index: 0 };
    }

    forceSwipe(direction) {
        let swipeAmount = SCREEN_WIDTH * direction
        Animated.timing(this.state.position, {
            toValue: { x: swipeAmount * 1.5, y: 0 },
            duration: SWIPE_OUT_DURATION
        }).start(() => this.onSwipeComplete(direction))
    }

    onSwipeComplete(direction) {
        const { onSwipeLeft, onSwipeRight, data } = this.props;
        const item = data[this.state.index];
        direction === DIRECTION_RIGHT ? onSwipeRight(item) : onSwipeLeft(item);
        this.state.position.setValue({ x: 0, y: 0 })
        this.setState({ index: this.state.index + 1 })
    }

    resetPosition() {
        Animated.spring(this.state.position, {
            toValue: {
                x: 0,
                y: 0
            }
        }).start();
    }

    getCardStyle() {
        const { position } = this.state;
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
            outputRange: ["-50deg", "0deg", "50deg"]
        })

        return {
            ...position.getLayout(),
            transform: [{ rotate }]
        };
    }

    renderCards() {

        if (this.state.index >= this.props.data.length) return this.props.renderNoMoreCards();

        return this.props.data.map((item, idx) => {
            if (idx < this.state.index) return null;
            else if (idx === this.state.index) {
                return (
                    <Animated.View
                        key={item.id}
                        style={[this.getCardStyle(), styles.cardStyle, { elevation: 1, zIndex: 999 }]}
                        {...this.state.panResponder.panHandlers}
                    >
                        {this.props.renderCard(item)}
                    </Animated.View>
                )
            }
            return (
                <View key={item.id} style={[styles.cardStyle, { top: 8 * (idx - this.state.index), left: 8 * (idx - this.state.index) }]}>
                    {this.props.renderCard(item)}
                </View>
            );
        })
    }


    componentWillUpdate() {
        UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
        LayoutAnimation.spring()
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.props.data) {
            this.setState({ index: 0 });
        }
    }

    render() {
        return (
            <Animated.View>
                {this.renderCards()}
            </Animated.View>
        )
    }
}

const styles = {
    cardStyle: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    }
}

export default Deck;