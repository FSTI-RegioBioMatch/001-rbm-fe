import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SupabaseService } from './supabase.service';
import { forkJoin, from, map, Observable } from 'rxjs';
import { fromPromise } from 'rxjs/internal/observable/innerFrom';
import { PublicRecipeType } from '../types/public-recipe.type';

@Injectable({
  providedIn: 'root',
})
export class PublicRecipeService {
  constructor(
    private http: HttpClient,
    private supabaseService: SupabaseService,
  ) {}

  getImagesByImageFolderUUID(folderUUID: string): Observable<string[]> {
    const promise = this.supabaseService.supabaseClient.storage
      .from('recipe_img')
      .list(folderUUID)
      .then(({ data, error }) => {
        if (error) {
          throw error;
        }

        return data.map((file: any) => {
          return this.supabaseService.supabaseClient.storage
            .from('recipe_img')
            .getPublicUrl(`${folderUUID}/${file.name}`).data.publicUrl;
        });
      });

    return fromPromise(promise);
  }

  // DONT USE IT SINCE IT WILL LOAD ALL IMAGES
  getAllImagesWithFolderUUID() {
    const tempData: { folderUUID: string; images: string[] }[] = [];

    const promise = this.supabaseService.supabaseClient.storage
      .from('recipe_img')
      .list()
      .then(({ data, error }) => {
        if (error) {
          throw error;
        }
        this.supabaseService.supabaseClient.storage
          .from('recipe_img')
          .list()
          .then(({ data, error }) => {
            if (error) {
              throw error;
            }
            data.forEach((folder) => {
              this.getImagesByImageFolderUUID(folder.name).subscribe(
                (images) => {
                  tempData.push({ folderUUID: folder.name, images });
                },
              );
            });
          });
        console.log(tempData);
      });
  }

  getImagesByImageFolderUUIDs(folderUUIDs: string[]) {
    const observables = folderUUIDs.map((folderUUID) =>
      this.getImagesByImageFolderUUID(folderUUID),
    );

    return forkJoin(observables).pipe(
      map((results) => {
        return results.map((images, index) => {
          return { folderUUID: folderUUIDs[index], images };
        });
      }),
    );
  }

  getRecipes(): Observable<PublicRecipeType[]> {
    return fromPromise(
      this.supabaseService.supabaseClient
        .from('recipes')
        .select('*')
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }
          return data;
        }),
    );
  }
}
