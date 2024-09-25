import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly STORAGE_PREFIX = 'myApp_'; // Optional prefix for your app's data

  constructor(
  ) {}

  // Set a key/value
  public async set(key: string, value: any) {
    const storageKey = this.STORAGE_PREFIX + key;
    /* localStorage.setItem(storageKey, JSON.stringify(value)); */

    await Preferences.set({ key: storageKey, value: JSON.stringify(value) });
  }

  // Get a value from storage
  public async get(key: string): Promise<any | null> {
    /* const storageKey = this.STORAGE_PREFIX + key;
    const item = localStorage.getItem(storageKey);
    if (!item) {
      return null;
    }
    try {
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error parsing data from localStorage key '${storageKey}':`, error);
      return null;
    } */

      const storageKey = this.STORAGE_PREFIX + key;
      console.log('storageKey', storageKey);
      const item = await Preferences
      .get({ key: storageKey });
      if (!item.value) {
        return null;
      }
      try {
        return JSON.parse(item.value);
      } catch (error) {
        console.error(`Error parsing data from Capacitor Storage key '${storageKey}':`, error);
        return null;
      }
  }

  // search for a value in storage
  public async search(key: string): Promise<any | null> {
    const storageKey = this.STORAGE_PREFIX + key;
    const item = localStorage.getItem(storageKey);
    if (!item) {
      return null;
    }
    try {
      return JSON.parse(item);
    } catch (error) {
      console.error(`Error parsing data from localStorage key '${storageKey}':`, error);
      return null;
    }
  }

  // Remove a key
  public remove(key: string) {
    const storageKey = this.STORAGE_PREFIX + key;
    localStorage.removeItem(storageKey);
  }

  // Clear all storage
  public clear() {
    localStorage.clear();
  }


  

  
}
