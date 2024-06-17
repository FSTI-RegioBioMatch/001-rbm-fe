import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class PublicRecipeService {
  constructor(
    private http: HttpClient,
    private supabaseService: SupabaseService,
  ) {}

  async getImagesByImageFolderUUID(folderUUID: string): Promise<any> {
    try {
      const { data, error } = await this.supabaseService.supabaseClient.storage
        .from('recipe_img')
        .list(folderUUID);

      if (error) {
        throw error;
      }

      const imageLinks = data.map((file: any) => {
        return this.supabaseService.supabaseClient.storage
          .from('recipe_img')
          .getPublicUrl(`${folderUUID}/${file.name}`);
      });

      const links: string[] = [];
      for (const link of imageLinks) {
        const { data } = link;
        if (error) {
          throw error;
        }
        links.push(data.publicUrl);
      }

      return links;
    } catch (error) {
      console.error('Error listing images:', error);
      return null;
    }
  }
}
