import { FoodItem } from './api';

const FATSECRET_BASE_URL = 'https://platform.fatsecret.com/rest/server.api';

class FatSecretAPI {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  async initialize() {
    // API keys are now from environment variables
    return true;
  }

  private async getAccessToken(): Promise<string> {
    const clientId = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_ID;
    const clientSecret = process.env.EXPO_PUBLIC_FATSECRET_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('FatSecret API credentials not configured');
    }

    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const credentials = btoa(`${clientId}:${clientSecret}`);
    
    const response = await fetch('https://oauth.fatsecret.com/connect/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials&scope=basic',
    });

    if (!response.ok) {
      throw new Error('Failed to get FatSecret access token');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Subtract 1 minute for safety

    return this.accessToken;
  }

  private async makeRequest(method: string, params: Record<string, any> = {}): Promise<any> {
    const token = await this.getAccessToken();
    
    const searchParams = new URLSearchParams({
      method,
      format: 'json',
      ...params,
    });

    const response = await fetch(`${FATSECRET_BASE_URL}?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`FatSecret API error: ${response.statusText}`);
    }

    return response.json();
  }

  async searchFoods(query: string, maxResults: number = 20): Promise<FoodItem[]> {
    try {
      // Use the new v3 endpoint
      const data = await this.makeRequest('foods.search.v3', {
        search_expression: query,
        max_results: maxResults,
        include_sub_categories: true,
      });

      if (!data.foods_search || !data.foods_search.results) {
        return [];
      }

      const foods = data.foods_search.results.food || [];
      
      return foods.map((food: any) => ({
        id: `fatsecret_${food.food_id}`,
        name: food.food_name,
        brand: food.brand_name || undefined,
        calories_per_100g: 0, // Will be filled by getFood
        protein_per_100g: 0,
        carbs_per_100g: 0,
        fat_per_100g: 0,
        fatsecret_id: food.food_id,
      }));
    } catch (error) {
      console.error('FatSecret search error:', error);
      return [];
    }
  }


  async getFood(foodId: string): Promise<FoodItem | null> {
    try {
      const data = await this.makeRequest('food.get', {
        food_id: foodId,
      });

      if (!data.food) {
        return null;
      }

      const food = data.food;
      const servings = food.servings?.serving;
      
      // Find per 100g serving or calculate from other servings
      let per100g = null;
      if (Array.isArray(servings)) {
        per100g = servings.find((s: any) => s.serving_description?.includes('100g'));
        if (!per100g && servings.length > 0) {
          // Use first serving and convert to per 100g
          const serving = servings[0];
          const weight = parseFloat(serving.metric_serving_amount) || 100;
          const factor = 100 / weight;
          
          per100g = {
            calories: (parseFloat(serving.calories) || 0) * factor,
            protein: (parseFloat(serving.protein) || 0) * factor,
            carbohydrate: (parseFloat(serving.carbohydrate) || 0) * factor,
            fat: (parseFloat(serving.fat) || 0) * factor,
            fiber: (parseFloat(serving.fiber) || 0) * factor,
            sugar: (parseFloat(serving.sugar) || 0) * factor,
            sodium: (parseFloat(serving.sodium) || 0) * factor,
          };
        }
      } else if (servings) {
        per100g = servings;
      }

      if (!per100g) {
        return null;
      }

      return {
        id: `fatsecret_${food.food_id}`,
        name: food.food_name,
        brand: food.brand_name || undefined,
        calories_per_100g: parseFloat(per100g.calories) || 0,
        protein_per_100g: parseFloat(per100g.protein) || 0,
        carbs_per_100g: parseFloat(per100g.carbohydrate) || 0,
        fat_per_100g: parseFloat(per100g.fat) || 0,
        fiber_per_100g: parseFloat(per100g.fiber) || 0,
        sugar_per_100g: parseFloat(per100g.sugar) || 0,
        sodium_per_100g: parseFloat(per100g.sodium) || 0,
        fatsecret_id: food.food_id,
      };
    } catch (error) {
      console.error('FatSecret getFood error:', error);
      return null;
    }
  }

  isConfigured(): boolean {
    return !!(process.env.EXPO_PUBLIC_FATSECRET_CLIENT_ID && process.env.EXPO_PUBLIC_FATSECRET_CLIENT_SECRET);
  }
}

export const fatSecretAPI = new FatSecretAPI();