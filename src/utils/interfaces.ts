export interface WeatherData {
    name: string;
    temp_celsius: number;
    temp_fahrenheit: number;
    humidity: number;
    wind_kph: number;
    wind_mph: number;
    comment: string;
}

export interface ForecastData {
    day: number;
    avg_temp_celsius: number;
    avg_temp_fahrenheit: number;
    humidity: number;
    wind_kph: number;
    wind_mph: number;
}