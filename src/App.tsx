import {MutableRefObject, useRef, useState} from 'react';
import url from "./utils/weatherapi";

import "./styles/App.css";

interface WeatherData {
    name: string;
    temp_celsius: number;
    temp_fahrenheit: number;
    humidity: number;
    wind_kph: number;
    comment: string;
}

interface ForcastData {
    day: Array<number>;
    avg_temp_celsius: Array<number>;
    avg_temp_fahrenheit: Array<number>;
    humidity: Array<number>;
    wind_kph: Array<number>;
}

function App() {
    const getData = useRef() as MutableRefObject<HTMLInputElement>;
    const [weather, getWeatherData] = useState<WeatherData>({
        name: "",
        temp_celsius: 0,
        temp_fahrenheit: 0,
        humidity: 0,
        wind_kph: 0,
        comment: "",
    });

    const [forcast, getForcastData] = useState<ForcastData>({
        day: [],
        avg_temp_celsius: [],
        avg_temp_fahrenheit: [],
        humidity: [],
        wind_kph: [],
    });

    const getWeather = async (e:any) => {
        e.preventDefault();

        // Current Weather Info
        await url.get<any>(`/current.json?key=7f75fdc3787c48a29a574714231602&q=${getData.current.value}&aqi=no`)
            .then(res => {
                getWeatherData({
                    name: res.data.location.name,
                    temp_celsius: res.data.current.temp_c,
                    temp_fahrenheit: res.data.current.temp_f,
                    humidity: res.data.current.humidity,
                    wind_kph: res.data.current.wind_kph,
                    comment: res.data.current.condition.text
                })
            });
        
        // Forecast Weather Info
        await url.get<any>(`/forecast.json?key=7f75fdc3787c48a29a574714231602&q=${getData.current.value}&days=10&aqi=no&alerts=no`)
            .then(res => {
                console.log(res.data.forecast.forecastday);
            })
    }

  return (
    <div className="App">
        <h1 id="main-heading">Weather App</h1>

        <form onSubmit={getWeather}>
            <input type="text" name="city" placeholder="Enter a city" ref={getData} />
        </form>
        
        {weather.name ? <p className="weather-data name">{weather.name}</p> : null}
        {weather.temp_celsius ? <p className="weather-data temp">{weather.temp_celsius}°C</p> : null}
        {weather.comment ? <p className="weather-data comment">{weather.comment}</p> : null}
        {weather.humidity && weather.wind_kph ? <p className="weather-data humidity">Humidity: {weather.humidity}% | Wind: {weather.wind_kph} kph</p> : null}
    </div>
  );
}

export default App;
