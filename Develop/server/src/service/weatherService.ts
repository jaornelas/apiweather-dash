import dayjs from 'dayjs';
import dotenv from 'dotenv';
dotenv.config();

// an interface for the Coordinates object
interface Coordinates {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  state: string;
}

// Defining a class for the Weather object
class Weather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  date: string;
  icon: string;
  iconDescription: string;
  city: string;
  constructor(
    temperature: number,
    humidity: number,
    windSpeed: number,
    date: string,
    icon: string,
    iconDescription: string,
    city: string) {
    this.temperature = temperature;
    this.humidity = humidity;
    this.windSpeed = windSpeed;
    this.date = date;
    this.icon = icon;
    this.iconDescription = iconDescription;
    this.city = city;
  }
}

// Defining the weather service class
class WeatherService {
  // TODO: Define the baseURL, API key, and city name properties
  private baseURL?: string;

  private apiKey?: string;

  private city = '';

  constructor() {
    this.baseURL = process.env.API_BASE_URL || 'https://api.openweathermap.org';
    this.apiKey = process.env.API_KEY || 'a3cc86ac0ea4efc145faff12f3e4ee65';
  }

  // private convertKelvinToFahrenheit(kelvin: number): number {
  //   console.log(kelvin);
  //   return parseFloat(((kelvin - 273.15) * (9 / 5) + 32).toFixed(1));
  // }

  // TODO: Create fetchLocationData method
  private async fetchLocationData(query: string) {
    try {
      if (!this.baseURL) {
        throw new Error('Base URL is not defined or Key is missing');
      }

      const response = await fetch(query);
      if (!response) {
        throw new Error('Network response was not ok');
      }
      
      const data: Coordinates[] = await response.json();
      if (data.length === 0) {
        throw new Error('No location data found');
      }

      return data[0];
    } catch (error) {
      console.error('Error fetching location data: ', error);
      throw error;
    }
  }

  // TODO: Create destructureLocationData method
  private destructureLocationData(locationData: Coordinates): Coordinates {
    if (!locationData) {
      throw new Error('Location data is missing');
    }

    const { name, latitude, longitude, country, state } = locationData;

    const coordinates: Coordinates = {
      name,
      latitude,
      longitude,
      country,
      state,
    };

    return coordinates;
  }

  // TODO: Create buildGeocodeQuery method
  private buildGeocodeQuery(): string {
    const geocodeQuery = `${this.baseURL}/geo/1.0/direct?q=${this.city}&limit=1&appid=${this.apiKey}`;
    return geocodeQuery;
  }

  // TODO: Create buildWeatherQuery method
  private buildWeatherQuery(coordinates: Coordinates): string {
    const weatherQuery = `${this.baseURL}/data/2.5/forecast?lat=${coordinates.latitude}&lon=${coordinates.longitude}&units=imperial&appid=${this.apiKey}`;
    return weatherQuery;
  }

  // TODO: Create fetchAndDestructureLocationData method
  private async fetchAndDestructureLocationData() {
    return await this.fetchLocationData(this.buildGeocodeQuery()).then((data) =>
      this.destructureLocationData(data)
    );
  }

  // TODO: Create fetchWeatherData method
  private async fetchWeatherData(coordinates: Coordinates) {
    try {
      const response = await fetch(this.buildWeatherQuery(coordinates)).then(
        (res) => res.json()
      );
      if (!response) {
        throw new Error('Weather data is missing');
      }

      const currentWeather: Weather = this.parseCurrentWeather(
        response.list[0]
      );

      const forecast: Weather[] = this.buildForecastArray(
        currentWeather,
        response.list
      );
      return forecast;
    } catch (error: any) {
      console.error('Error fetching weather data: ', error);
      return error;
    }
  }

  // TODO: Build parseCurrentWeather method
  private parseCurrentWeather(response: any): Weather {
    const parsedDate = dayjs.unix(response.dt).format('MM/DD/YYYY');

    const currentWeather = new Weather(
      response.main.temp,
      response.main.humidity,
      response.wind.speed,
      parsedDate,
      response.weather[0].icon,
      response.weather[0].description || response.weather[0].main,
      this.city
    );

    return currentWeather;

  };

  // TODO: Complete buildForecastArray method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]) {
    const weatherForecast: Weather[] = [currentWeather];

    const filteredWeatherData = weatherData.filter((data: any) => {
      return data.dt_txt.includes('12:00:00');
    });

    for (const day of filteredWeatherData) {
      weatherForecast.push(
        new Weather(
          day.main.temp,
          day.main.humidity,
          day.main.wind,
          day.dt_txt,
          day.weather[0].icon,
          day.weather[0].description || day.weather[0].main,
          this.city
        )
      );
    }

    return weatherForecast;
  }

  // TODO: Complete getWeatherForCity method
  async getWeatherForCity(city: string) {
    try {
      this.city = city;
      const coordinates = await this.fetchAndDestructureLocationData();
      if (coordinates) {
        const weatherData = await this.fetchWeatherData(coordinates);
        return weatherData;
      }

      throw new Error('Coordinates are missing');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

export default new WeatherService();
