import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';
import { hp, wp } from '../Utils/ResponsiveLayout';
import { COLORS } from '../Utils/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FONTS } from '../Utils/Fonts';

const Header = ({ title = 'Header Title', onPressButton }) => {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="keyboard-backspace"
        size={wp(26)}
        color={COLORS.BLACK}
        onPress={onPressButton}
      />
      <Text style={styles.titleText}>{title}</Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: hp(62),
    backgroundColor: COLORS.YELLOW_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(24),
  },
  titleText: {
    fontSize: wp(16),
    fontFamily: FONTS.POPPINS_SEMIBOLD,
    color: COLORS.BLACK,
    marginLeft: wp(12),
  },
});
