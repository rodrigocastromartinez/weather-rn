import axios from 'axios'

/**
 * Gets forecast for a given location
 * @param {number} lat location latitude
 * @param {number} lon location longitude
 * @returns {Promise} forecast for the given location
 */

export default function getForecast(lat, lon) {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,relativehumidity_2m,precipitation_probability,windspeed_10m&daily=weathercode,temperature_2m_max,sunrise&current_weather=true&timezone=Europe%2FBerlin`

    return axios.get(url).then(res => {
        return res.data
    })
}