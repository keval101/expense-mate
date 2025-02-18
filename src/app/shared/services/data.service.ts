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


  getExpenseTypes(userId: string) {
    return this.fireStore.collection('types').snapshotChanges()
    .pipe(
      map((actions) => {
        const types = actions.map((a) => {
          const data: any = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { ...data, id};
        });

        const filteredTypes = types.filter(type => type.userId === userId || type.delete === false);
        return filteredTypes;
      })
    );
  }

  saveExpenseType(payload: any) {
    return this.fireStore.collection('types').add(payload);
  }

  deleteExpenseType(id: string) {
    return this.fireStore.collection('types').doc(id).delete();
  }
}
