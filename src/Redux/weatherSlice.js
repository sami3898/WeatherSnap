import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  weatherData: [],
  isLoading: false,
  selectedCity: 0
};

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    setWeatherData: (state, action) => {
      state.weatherData = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setSelectedCity: (state, action) => {
      state.selectedCity = action.payload
    }
  },
});

export const {setWeatherData, setIsLoading, setSelectedCity} = weatherSlice.actions;
export default weatherSlice.reducer;
