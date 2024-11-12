import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MatcherService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  // Method to fetch all recipes
  async getAllRecipes() {
    const { data, error } = await this.supabase
      .from('recipes')
      .select('*');  // Selects all columns and all rows

    if (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }

    return data;
  }
}
