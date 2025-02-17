import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private fireStore: AngularFirestore
  ) { }


  getExpenseTypes() {
    return this.fireStore.collection('types').snapshotChanges()
    .pipe(
      map((actions) => {
        return actions.map((a) => {
          const data: any = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { ...data, id};
        });
      })
    );
  }
}
