import React, { useEffect } from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createDrawerNavigator} from '@react-navigation/drawer'
import {useFonts} from 'expo-font';
import * as SplashScreen from 'expo-splash-screen'
import { Provider, useSelector } from 'react-redux';
import store, { persister } from './src/Redux/store';
import { CustomDrawer } from './src/Component/CustomDrawer';

//Screens
import LocationScreen from './src/screens/LocationScreen';
import AddLocation from './src/screens/AddLocation';
import HomeScreen from './src/screens/HomeScreen';
import { PersistGate } from 'redux-persist/integration/react';


const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();


const InitialStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
          name='LocationScreen'
          component={LocationScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen 
          name='AddLocationScreen'
          component={AddLocation}
          options={{
            headerShown: false,
          }}
        />
    </Stack.Navigator>
  )
}


const HomeStack = () => {
  return (
    <Drawer.Navigator
      useLegacyImplementation
      drawerContent={() => <CustomDrawer />}
    >
      <Drawer.Screen 
        name='HomeScreen'
        component={HomeScreen}
        options={{
          headerShown: false
        }}
      />
      <Drawer.Screen 
          name='AddLocationScreen'
          component={AddLocation}
          options={{
            headerShown: false,
          }}
        />
    </Drawer.Navigator>
  )
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const App = () => {
  const data = useSelector(state => state.weather.weatherData)
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
    'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
  })


  useEffect(() => {
    async function hideSpalshScreen() {
      await SplashScreen.hideAsync();
    }

    if (fontsLoaded) {
      hideSpalshScreen();
    }
    
  }, [fontsLoaded])

  if(!fontsLoaded) {
    return;
  }

  return (
    <NavigationContainer>
      {data?.length >= 1 ? <HomeStack /> : <InitialStack />}
    </NavigationContainer>
  )
}

export default () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persister} >
        <App />
      </PersistGate>
      
    </Provider>
  )
};