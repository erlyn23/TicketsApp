import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class RepositoryService<T> {

  constructor(private angularFireDatabase: AngularFireDatabase) { }

  async pushElement(route: string, object: any){
    await this.angularFireDatabase.database.ref(route).push(object);
  }

  async setElement(route: string, object:any){
    await this.angularFireDatabase.database.ref(route).set(object);
  }

  async updateElement(route: string, object: any){
    await this.angularFireDatabase.database.ref(route).update(object);
  }

  async getOneElement(route: string){
    (await this.angularFireDatabase.database.ref(route).get()).toJSON();
  }

  getAllElements(route: string): AngularFireObject<T>{
    return this.angularFireDatabase.object(route);
  }

  async deleteElement(route: string){
    await this.angularFireDatabase.database.ref(route).remove();
  }
}
