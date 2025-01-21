import fs from 'fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const _filename = fileURLToPath(import.meta.url);   // Get the filename of the current module
const _dirname = path.dirname(_filename);   // Get the directory name of the current module

// TODO: Define a City class with name and id properties
class City {
  name: string;
  id: string;
  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }
}


// TODO: Complete the HistoryService class
class HistoryService {
  filePath: string;
  cities: City[];

  constructor() {
    this.filePath = path.join(_dirname, '../../db/searchHistory.json');
  }

  // TODO: Define a read method that reads from the searchHistory.json file
  private async read() {
    try {
      const data = await fs.readFile(path.join(_dirname, 'searchHistory.json'), 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading search history: ', error);
    }
  }

  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(cities, null, 2));
    } catch (error) {
      console.error('Error writing search history: ', error);
    }
  }

  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities() {
    const citiesData = await this.read();
    return citiesData.map((city: any) => new City(city.name, city.id));
  }

  // TODO Define an addCity method that adds a city to the searchHistory.json file
  async addCity(cityName: string) {
    if (!city) {
      throw new Error('City cannot be blank');
    }

    const cities = await this.getCities();
    const newCity = new City(cityName, this.generateUniqueId());
    cities.push(newCity);
    console.log("Here is a new city: ", newCity);
    await this.write(cities);
    return newCity;
   }


  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  // async removeCity(id: string) {}

  private generateUniqueId(): number {
    return Date.now();
  }
}

export default new HistoryService();
