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

        let filteredTypes = types.filter(type => type?.user?.id === userId || type.delete === false);
        filteredTypes = filteredTypes.sort((a, b) => a.name.localeCompare(b.name)); 
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


  getExpenses(userId: string) {
    return this.fireStore.collection('expenses').snapshotChanges()
    .pipe(
      map((actions) => {
        const expenses = actions.map((a) => {
          const data: any = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { ...data, id};
        });

        const filteredExpenses = expenses.filter(expenses => expenses.user.id === userId);
        return filteredExpenses;
      })
    );
  }
  
  async saveExpense(payload: any) {
    const response = await this.fireStore.collection('users').doc(payload.user.id).collection('expenses').add(payload);
    return this.fireStore.collection('expenses').doc(response.id).set(payload);
  }

  async deleteExpense(id: string, userId: string) {
    await this.fireStore.collection('users').doc(userId).collection('expenses').doc(id).delete();
    await this.fireStore.collection('expenses').doc(id).delete();
  }



  getIncomes(userId: string, month: any) {
    return this.fireStore.collection('users').doc(userId).collection('incomes',
      ref => ref.where('month', '==', month) 
    ).snapshotChanges()
    .pipe(
      map((actions) => {
        const incomes = actions.map((a) => {
          const data: any = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { ...data, id};
        });
        return incomes;
      })
    );;
  }

  async saveIncome(payload: any) {
    await this.fireStore.collection('users').doc(payload.user.id).collection('incomes').add(payload);
    return this.fireStore.collection('incomes').add(payload);
  }
}
