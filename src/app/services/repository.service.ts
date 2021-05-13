import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
  providedIn: 'root'
})
export class RepositoryService {

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
    await this.angularFireDatabase.database.ref(route).get();
  }

  getAllElements(route: string){
    return this.angularFireDatabase.object(route).snapshotChanges();
  }

  async deleteElement(route: string){
    await this.angularFireDatabase.database.ref(route).remove();
  }
}
