import axios, { Axios } from "axios";

const url: Axios = axios.create({
    baseURL: "http://api.weatherapi.com/v1/"
});

export default url;