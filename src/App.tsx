import {MutableRefObject, useRef, useState, useEffect} from 'react';
import {parse, stringify} from 'flatted';
import url from "./utils/weatherapi";
import { WeatherData, ForecastData } from './utils/interfaces';

import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import PercentIcon from '@mui/icons-material/Percent';
import AirIcon from '@mui/icons-material/Air';
import SettingsSharpIcon from '@mui/icons-material/SettingsSharp';

import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

import "./styles/App.css";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function App() {
    useEffect(() => {
        //Fetch Live Weather from Geolocation automatically
        getLiveWeather();

        const tempUnit:any = localStorage.getItem('tempUnit');
        const windSpeedUnit:any = localStorage.getItem('windSpeedUnit');
        if (!tempUnit) {
            localStorage.setItem('tempUnit', stringify("°F"))
        }
        if (!windSpeedUnit) {
            localStorage.setItem('windSpeedUnit', stringify("mph"))
        }
    }, []);

    const getData = useRef() as MutableRefObject<HTMLInputElement>;
    const tempUnit = useRef() as MutableRefObject<HTMLSelectElement>;
    const windSpeedUnit = useRef() as MutableRefObject<HTMLSelectElement>;

    const [weather, setWeatherData] = useState<WeatherData>({
        name: "",
        temp_celsius: 0,
        temp_fahrenheit: 0,
        humidity: 0,
        wind_kph: 0,
        wind_mph: 0,
        comment: "",
    });

    const [forecast, setForecastData] = useState<ForecastData[]>([]);

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const callWeatherAPI = async (arg: any) => {
        await url.get<any>(`/forecast.json?key=${process.env.REACT_APP_WEATHER_API_KEY}&q=${arg}&days=10&aqi=no&alerts=no`)
            .then(res => {
                // Current Weather Info
                setWeatherData({
                    name: res.data.location.name,
                    temp_celsius: res.data.current.temp_c,
                    temp_fahrenheit: res.data.current.temp_f,
                    humidity: res.data.current.humidity,
                    wind_kph: res.data.current.wind_kph,
                    wind_mph: res.data.current.wind_kph,
                    comment: res.data.current.condition.text
                })

                // Forecast Weather Info
                const forecastArray = res.data.forecast.forecastday;
                forecastArray.map((i: any) => {
                    setForecastData((prev) => (
                        [...prev, {
                            day: new Date(i.date).getDay(),
                            avg_temp_celsius: i.day.avgtemp_c,
                            avg_temp_fahrenheit: i.day.avgtemp_f,
                            humidity: i.day.avghumidity,
                            wind_kph: i.day.maxwind_kph,
                            wind_mph: i.day.maxwind_mph
                        }]
                    ))
                    return null;
                });
            })
            .catch((err) => {
                if (err.response.status === 1006) {
                    alert(err);
                }
                else if (err.response.status === 1005) {
                    alert("Invalid API Key");
                }
            })
    }

    const setPreferences = (e:any) => {
        e.preventDefault();
        localStorage.setItem('tempUnit', stringify(tempUnit));
        localStorage.setItem('windSpeedUnit', stringify(windSpeedUnit));
        handleClose();
    }

    const getLiveWeather = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (pos) => {
                await callWeatherAPI(pos.coords.latitude + "," + pos.coords.longitude);
            })
        }
        else {
            alert("Geolocation is not supported in your browser!");
        }
    }

    const getWeather = async (e:any) => {
        e.preventDefault();

        setForecastData([]);

        await callWeatherAPI(getData.current.value);
    }

  return (
    <div className="App">
        <div id="settings">
            <SettingsSharpIcon onClick={handleOpen} fontSize="large" />
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description">
            <Box className="modalBox">
                <h1>Settings</h1>
                <form onSubmit={setPreferences}>
                    <label htmlFor="temperature">Temperature Unit: </label>
                    <select name="temperature" ref={tempUnit}>
                        <option value="°F">°F</option>
                        <option value="°C">°C</option>
                    </select>
                    <br />
                    <label htmlFor="wind">Wind Speed Unit: </label>
                    <select name="wind" ref={windSpeedUnit}>
                        <option value="kph">kph</option>
                        <option value="mph">mph</option>
                    </select>
                    <br />
                    <input type="submit" value="Save Preferences" />
                </form>
            </Box>
            </Modal>
        </div>

        <h1 id="main-heading">Weather App</h1>

        <form onSubmit={getWeather}>
            <input type="text" name="city" placeholder="Enter a city" ref={getData} />
        </form>
        
        {weather.name ? <p className="weather-data name">{weather.name}</p> : null}
        {weather.temp_celsius ? <p className="weather-data temp"><DeviceThermostatIcon className="socIcon" fontSize='large' color="error" />{weather.temp_celsius}°C</p> : null}
        {weather.comment ? <p className="weather-data comment">{weather.comment}</p> : null}
        {weather.humidity && weather.wind_kph ?
            <div id="hum-and-air-disp">
                <p className="weather-data humidity"><PercentIcon /> {weather.humidity}% <AirIcon /> {weather.wind_kph} kph</p>
            </div>
        : null}

        {forecast ? 
        <div className="forecast">
            {forecast.map((i, j) => {
                return (
                    <div className="forecast-box" key={j}>
                        <p>{days[i.day]}</p>
                        <p><DeviceThermostatIcon />{i.avg_temp_celsius}°C</p>
                        <p><PercentIcon /> {i.humidity}% | <AirIcon /> {i.wind_kph} kph</p>
                    </div>        
                )
            })}
        </div> : null}
    </div>
  );
}

export default App;
