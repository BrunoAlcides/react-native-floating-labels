'use strict';
import React, { Component, PropTypes } from 'react';

import {
  StyleSheet,
  TextInput,
  LayoutAnimation,
  Animated,
  Easing,
  Text,
  View,
  Platform
} from 'react-native';

import { omit } from 'lodash'

var textPropTypes = Text.propTypes || View.propTypes
var textInputPropTypes = TextInput.propTypes || textPropTypes
var propTypes = {
  ...textInputPropTypes,
  inputStyle: textInputPropTypes.style,
  labelStyle: textPropTypes.style,
  disabled: PropTypes.bool,
  style: View.propTypes.style,
}

var FloatingLabel  = React.createClass({
  propTypes: propTypes,

  getInitialState () {
    var state = {
      text: this.props.value,
      dirty: (this.props.value || this.props.placeholder)
    };

    var style = state.dirty ? dirtyStyle : cleanStyle
    state.labelStyle = {
      fontSize: new Animated.Value(style.fontSize),
      top: new Animated.Value(style.top)
    }

    return state
  },

  componentWillReceiveProps (props) {
    if (typeof props.value !== 'undefined' && props.value !== this.state.text) {
      this.setState({ text: props.value, dirty: !!props.value })
      this._animate(!!props.value)
    }
  },

  _animate(dirty) {
    var nextStyle = dirty ? dirtyStyle : cleanStyle
    var labelStyle = this.state.labelStyle
    var anims = Object.keys(nextStyle).map(prop => {
      return Animated.timing(
        labelStyle[prop],
        {
          toValue: nextStyle[prop],
          duration: 200
        },
        Easing.ease
      )
    })

    Animated.parallel(anims).start()
  },

  _onFocus () {
    this._animate(true)
    this.setState({dirty: true})
    if (this.props.onFocus) {
      this.props.onFocus(arguments);
    }
  },

  _onBlur () {
    if (!this.state.text) {
      this._animate(false)
      this.setState({dirty: false});
    }

    if (this.props.onBlur) {
      this.props.onBlur(arguments);
    }
  },

  onChangeText(text) {
    this.setState({ text })
    if (this.props.onChangeText) {
      this.props.onChangeText(text)
    }
  },

  updateText(event) {
    var text = event.nativeEvent.text
    this.setState({ text })

    if (this.props.onEndEditing) {
      this.props.onEndEditing(event)
    }
  },

  _renderLabel () {
    const { labelStyle = [] } = this.props

    return (
      <Animated.Text
        ref={(label) => { this.label = label; }}
        numberOfLines={this.props.numberOfLines}
        style={[this.state.labelStyle, styles.label, ...labelStyle]}
      >
        {this.props.children}
      </Animated.Text>
    )
  },

  render() {
    const {
      inputStyle = [],
      style = []
    } = this.props

    const rest = omit(this.props, 'children')

    const textInputProps = {
      ...rest,
      onBlur: this._onBlur,
      onChangeText: this.onChangeText,
      onEndEditing: this.updateText,
      onFocus: this._onFocus,
      style: [styles.input].concat(inputStyle),
      value: this.state.text
    }

    const elementStyles = [styles.element].concat(style);

    return (
  		<View style={elementStyles}>
        {this._renderLabel()}
        <TextInput
          ref={(input) => { this.input = input; }}
          {...textInputProps}
        >
        </TextInput>
      </View>
    );
  },
});

var labelStyleObj = {
  marginTop: 21,
  paddingLeft: 9,
  color: '#AAA',
  position: 'absolute'
}

if (Platform.OS === 'web') {
  labelStyleObj.pointerEvents = 'none'
}

var styles = StyleSheet.create({
  element: {
    position: 'relative'
  },
  input: {
    height: 40,
    borderColor: 'gray',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    borderWidth: 1,
    color: 'black',
    fontSize: 20,
    borderRadius: 4,
    paddingLeft: 10,
    marginTop: 20,
  },
  label: labelStyleObj
})

var cleanStyle = {
  fontSize: 20,
  top: 7
}

var dirtyStyle = {
  fontSize: 12,
  top: -17,
}

module.exports = FloatingLabel;
