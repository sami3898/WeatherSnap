import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  StatusBar,
  FlatList,
  Image,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { COLORS } from "../Utils/Colors";
import Icon from "@expo/vector-icons/MaterialIcons";
import { DEVICE_WIDTH, hp, wp } from "../Utils/ResponsiveLayout";
import { FONTS } from "../Utils/Fonts";
import LottieView from "lottie-react-native";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import {
  setIsLoading,
  setSelectedCity,
  setWeatherData,
} from "../Redux/weatherSlice";
import { fetchWeather } from "../Utils/ApiHelper";
import { useNavigation } from "@react-navigation/native";
import Loader from "../Component/Loader";

const HomeScreen = () => {
  // Redux selector
  const weatherData = useSelector((state) => state.weather.weatherData);
  const selectedCity = useSelector((state) => state.weather.selectedCity);
  const isLoading = useSelector((state) => state.weather.isLoading);
  // State variable
  const [hourlyData, setHourlyData] = useState({});
  const [forecastData, setForecastData] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [currentHour, setCurrentHour] = useState(0);
  const [currentWeather, setCurrentWeather] = useState({});
  const [weatherAlerts, setWeatherAlerts] = useState([]);
  // Other
  const flatListRef = useRef();
  const dispatch = useDispatch();
  const navigation = useNavigation();

  useEffect(() => {
    const foreCastData = weatherData[selectedCity]?.forecast?.forecastday;
    foreCastData?.map((e, i) => {
      if (i === 0) {
        setHourlyData(e);
      }
    });
    setForecastData(foreCastData);
    setWeatherAlerts(weatherData[selectedCity]?.alerts?.alert)
  }, [weatherData, refreshing]);

  useEffect(() => {
    let currentHour = weatherData[selectedCity]?.current?.last_updated;
    currentHour = new Date(currentHour).getHours();
    setCurrentHour(currentHour);

    hourlyData?.hour?.map((e, i) => {
      if (new Date(e.time).getHours() === currentHour) {
        setCurrentWeather(e);
      }
    });

    if (hourlyData?.hour !== undefined) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: currentHour,
          animated: true,
        });
      }, 1000);
    }
  }, [hourlyData, weatherData]);

  // On refresh home screen
  const onRefresh = async () => {
    setRefreshing(true);
    let weatherResponse = await fetchWeather(
      weatherData[selectedCity]?.location?.name
    );
    if (weatherResponse?.error) {
      Alert.alert("Error", weatherResponse?.error?.message);
      setRefreshing(false);
    } else {
      
      let copyOfWeatherData = weatherData;
      copyOfWeatherData[selectedCity] = weatherResponse;
      dispatch(setWeatherData(copyOfWeatherData));
      setRefreshing(false);
    }
  };

  // Rollback to error index if scroll index fail
  const scrollToIndexFailed = (error) => {
    const offset = error.averageItemLength * error.index;
    flatListRef.current.scrollToOffset({ offset });
    setTimeout(
      () => flatListRef.current.scrollToIndex({ index: error.index }),
      100
    ); 
  };

  // On remove city
  const onPressRemove = () => {
    dispatch(setIsLoading(true));
    let tempData = weatherData;
    setTimeout(() => {
      // if more than 1 city available
      if (tempData?.length > 1) {
        tempData = tempData?.filter((item, index) => index !== selectedCity);
        dispatch(setWeatherData(tempData));
        // Reseting selectedCity to 0 if first city is deleted
        selectedCity === 0
          ? dispatch(setSelectedCity(0))
          : dispatch(setSelectedCity(selectedCity - 1));
        dispatch(setIsLoading(false));
      } else {
        dispatch(setWeatherData([]));
        dispatch(setIsLoading(false));
      }
    }, 1000);
  };

  // Render Hourly forecast
  const _renderItem = ({ item, index }) => {
    return (
      <View
        style={[
          styles.foreCastContainer,
          {
            backgroundColor:
              currentHour === index ? COLORS.BLACK : COLORS.YELLOW_COLOR,
            borderColor: currentHour === index ? COLORS.WHITE : COLORS.BLACK,
          },
        ]}
      >
        <Text
          style={[
            styles.foreCastTemp,
            { color: currentHour === index ? COLORS.WHITE : COLORS.BLACK },
          ]}
        >{`${Math.ceil(item?.temp_c)}°`}</Text>
        <Image
          source={{
            uri: "https:" + item?.condition?.icon,
          }}
          style={[
            styles.forecastIconStyle,
            { tintColor: currentHour === index ? COLORS.WHITE : COLORS.BLACK },
          ]}
        />
        <Text
          style={[
            styles.foreCastDate,
            { color: currentHour === index ? COLORS.WHITE : COLORS.BLACK },
          ]}
        >
          {moment(item.time).format("LT")}
        </Text>
      </View>
    );
  };

  // Display date on future day forecast
  const displayDate = (date) => {
    const todayDate = moment().endOf("day").format("YYYY-MM-DD");
    if (date === todayDate) {
      return "Today";
    } else {
      return moment(date).format("ddd");
    }
  };

  // Render future forecast
  const _renderForeCastItem = ({ item, index }) => {
    return (
      <View style={styles.foreCastContainer}>
        <Text style={styles.foreCastTemp}>
          {Math.ceil(item?.day?.avgtemp_c)}°
        </Text>
        <Image
          source={{
            uri: "https:" + item?.day?.condition?.icon,
          }}
          style={[styles.forecastIconStyle]}
        />
        <Text style={styles.foreCastDate}>{displayDate(item?.date)}</Text>
      </View>
    );
  };

  // Render Alert View
  const _renderAlertView = () => {
    let defaultPagination = 0;
    return (
      <View style={styles.alertContainer}>
        <Text style={styles.summaryTitle}>Alert</Text>
        <View style={styles.alertInnerContainer}>
          <ScrollView 
            nestedScrollEnabled 
            pagingEnabled 
            horizontal
            disableIntervalMomentum={ true } 
            snapToInterval={DEVICE_WIDTH - wp(70)}
            showsHorizontalScrollIndicator={false}
          >
            {weatherAlerts?.map((e,i) => {
              return (
                <View style={{ width: DEVICE_WIDTH - wp(70),  }}>
                <Text numberOfLines={2} style={styles.alertHeadline}>{e.headline}</Text>
                <Text style={styles.alertDesc}>{e.desc}</Text>
              </View>
              )
            })}
          </ScrollView>
          {weatherAlerts.length > 1 && <View style={styles.pagingContainer}> 
              <Text style={styles.pagingText}>{`${defaultPagination + 1} / ${weatherAlerts.length}`}</Text>
          </View>}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor={COLORS.YELLOW_COLOR}
        barStyle={"dark-content"}
      />
      <View style={styles.topContainer}>
        <Icon
          name="menu"
          size={wp(26)}
          onPress={() => navigation.toggleDrawer()}
        />
        <Text
          numberOfLines={2}
          style={styles.cityText}
        >{`${weatherData[selectedCity]?.location?.name}, ${weatherData[selectedCity]?.location?.country}`}</Text>
        <Icon
          name="remove-circle-outline"
          size={wp(26)}
          onPress={() => onPressRemove()}
        />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => onRefresh()}
          />
        }
      >
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {moment(currentWeather?.time).format("dddd, DD MMMM")}
          </Text>
        </View>
        <Text style={styles.conditionText}>
          {currentWeather?.condition?.text}
        </Text>
        <Text style={styles.tempText}>{`${Math.ceil(
          currentWeather?.temp_c
        )}°`}</Text>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Daily Summary</Text>
          <Text style={styles.summaryText}>
            {`Now it's feels like +${Math.ceil(
              currentWeather?.feelslike_c
            )}°, actully +${Math.ceil(currentWeather?.temp_c)}°`}
          </Text>
          <Text style={styles.summaryText}>
            {`the temprature is felt in the range from +${Math.ceil(
              hourlyData?.day?.maxtemp_c
            )}° to +${Math.ceil(hourlyData?.day?.mintemp_c)}°`}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <LottieView
              autoPlay
              source={require("../../assets/animation/wind.json")}
              style={{
                height: wp(50),
                width: wp(50),
              }}
            />
            <Text
              style={styles.infoMainText}
            >{`${currentWeather?.wind_kph}Km/h`}</Text>
            <Text style={styles.infoText}>Wind</Text>
          </View>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <LottieView
              autoPlay
              source={require("../../assets/animation/humidity.json")}
              style={{
                height: wp(50),
                width: wp(50),
              }}
              resizeMode="cover"
            />
            <Text
              style={styles.infoMainText}
            >{`${currentWeather?.humidity}%`}</Text>
            <Text style={styles.infoText}>Humidity</Text>
          </View>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <LottieView
              autoPlay
              source={require("../../assets/animation/eye1.json")}
              style={{
                height: wp(50),
                width: wp(50),
              }}
            />
            <Text
              style={styles.infoMainText}
            >{`${currentWeather?.vis_km}Km`}</Text>
            <Text style={styles.infoText}>Visibility</Text>
          </View>
        </View>
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Hourly forecast</Text>

          <FlatList
            ref={flatListRef}
            data={hourlyData?.hour}
            renderItem={_renderItem}
            horizontal
            ItemSeparatorComponent={() => {
              return <View style={{ width: 12 }} />;
            }}
            style={{ width: "100%", marginVertical: hp(16) }}
            showsHorizontalScrollIndicator={false}
            onScrollToIndexFailed={scrollToIndexFailed}
            // extraData={weatherData}
          />
        </View>
        <View style={styles.summaryContainer}>
          <Text
            style={styles.summaryTitle}
          >{`${forecastData?.length} Days forecast`}</Text>

          <FlatList
            data={forecastData}
            renderItem={_renderForeCastItem}
            horizontal
            ItemSeparatorComponent={() => {
              return <View style={{ width: 12 }} />;
            }}
            style={{ width: "100%", marginVertical: hp(16) }}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </ScrollView>
      {isLoading && <Loader title="Removing City" />}
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.YELLOW_COLOR,
  },
  topContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: wp(24),
    marginTop: hp(16),
  },
  cityText: {
    flex: 1,
    marginHorizontal: wp(12),
    fontSize: wp(18),
    fontFamily: FONTS.POPPINS_BOLD,
    color: COLORS.BLACK,
    textAlign: "center",
    alignSelf: "center",
  },
  tempText: {
    fontSize: wp(110),
    fontFamily: FONTS.POPPINS_REGULAR,
    color: COLORS.BLACK,
    textAlign: "center",
  },
  conditionText: {
    fontSize: wp(18),
    fontFamily: FONTS.POPPINS_REGULAR,
    color: COLORS.BLACK,
    textAlign: "center",
  },
  dateContainer: {
    paddingVertical: hp(6),
    paddingHorizontal: wp(12),
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.BLACK,
    borderRadius: 60,
    marginVertical: hp(14),
    alignSelf: "center",
  },
  dateText: {
    fontSize: wp(14),
    fontFamily: FONTS.POPPINS_REGULAR,
    color: COLORS.WHITE,
  },
  summaryContainer: {
    alignItems: "flex-start",
    marginHorizontal: wp(24),
  },
  summaryTitle: {
    fontSize: wp(16),
    fontFamily: FONTS.POPPINS_BOLD,
    color: COLORS.BLACK,
  },
  summaryText: {
    fontSize: wp(12),
    fontFamily: FONTS.POPPINS_SEMIBOLD,
    color: COLORS.BLACK,
    marginTop: hp(6),
  },
  infoContainer: {
    marginHorizontal: wp(24),
    marginVertical: hp(24),
    borderColor: COLORS.BLACK,
    borderWidth: 3,
    borderRadius: 12,
    paddingHorizontal: wp(20),
    paddingVertical: hp(16),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoMainText: {
    fontSize: wp(16),
    fontFamily: FONTS.POPPINS_BOLD,
    color: COLORS.BLACK,
    marginTop: hp(10),
  },
  infoText: {
    fontSize: wp(14),
    fontFamily: FONTS.POPPINS_REGULAR,
    color: COLORS.BLACK,
  },
  foreCastContainer: {
    paddingVertical: hp(12),
    paddingHorizontal: wp(8),
    borderWidth: 2,
    borderColor: COLORS.BLACK,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    width: wp(72),
  },
  foreCastTemp: {
    fontSize: wp(12),
    fontFamily: FONTS.POPPINS_SEMIBOLD,
    color: COLORS.BLACK,
  },
  foreCastDate: {
    fontSize: wp(10),
    fontFamily: FONTS.POPPINS_REGULAR,
    color: COLORS.BLACK,
    textAlign: "center",
  },
  forecastIconStyle: {
    height: wp(30),
    width: wp(30),
    tintColor: COLORS.BLACK,
  },
  alertContainer: {
    marginHorizontal: wp(24),
    paddingVertical: hp(12),
  },
  alertInnerContainer: {
    flex: 1,
    borderColor: COLORS.ALERT,
    borderWidth: 3,
    borderRadius: 12,
    padding: wp(8),
    marginVertical: 8,
    // minHeight: hp(150)
  },
  alertHeadline: {
    fontSize: wp(14),
    fontFamily: FONTS.POPPINS_SEMIBOLD,
    color: COLORS.BLACK,
    width: "95%",
  },
  alertDesc: {
    fontSize: wp(12),
    fontFamily: FONTS.POPPINS_REGULAR,
    color: COLORS.BLACK,
    marginTop: hp(4),
    width: "95%",
  },
  pagingContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(8),
    paddingVertical: hp(4),
    borderRadius: 20,
  },
  pagingText: {
    fontSize: wp(12),
    fontFamily: FONTS.POPPINS_REGULAR,
    color: COLORS.WHITE
  }
});
