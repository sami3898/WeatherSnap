import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DEVICE_WIDTH, wp } from '../Utils/ResponsiveLayout';
import { FONTS } from '../Utils/Fonts';
import { COLORS } from '../Utils/Colors';

const Button = ({
  title = 'button',
  buttonStyle,
  buttonTextStyle,
  mode = 'solid',
  onPress,
}) => {
  const containerStyle = [
    styles.container,
    buttonStyle,
    {
      borderWidth: mode !== 'solid' ? 2 : 0,
      borderColor: COLORS.BLACK,
      backgroundColor: mode !== 'solid' ? COLORS.YELLOW_COLOR : COLORS.BLACK,
    },
  ];

  const textStyle = [
    styles.buttonText,
    buttonTextStyle,
    {
      color: mode !== 'solid' ? COLORS.BLACK : COLORS.WHITE,
    },
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={containerStyle}
      onPress={onPress}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

export default Button;

const styles = StyleSheet.create({
  container: {
    width: DEVICE_WIDTH - 48,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BLACK,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: wp(16),
    fontFamily: FONTS.POPPINS_SEMIBOLD,
    color: COLORS.WHITE,
  },
});
