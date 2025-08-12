import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs';
import { AuthService } from './auth.service';

interface Transaction {
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private fireStore: AngularFirestore,
    private authService: AuthService
  ) { }

  async updateUserRemainingBalance() {
    const user = await this.authService.getCurrentUserDetail();
    // const remainingBalance = (user?.totalIncome ?? 0) - (user?.totalExpense ?? 0);
    // return this.fireStore.collection('users').doc(user.id).update({ remainingBalance });
    try {
      // Calculate totals from income collection
      const incomeSnapshot = await this.fireStore
        .collection(`users/${user.id}/incomes`)
        .get()
        .toPromise();
      
      const totalIncome = incomeSnapshot?.docs
        .map(doc => (doc.data() as Transaction)['amount'] || 0) // Replace 'amount' with your field name
        .reduce((sum, amount) => sum + amount, 0);

      // Calculate totals from expense collection
      const expenseSnapshot = await this.fireStore
        .collection(`users/${user.id}/expenses`)
        .get()
        .toPromise();
      
      const totalExpense = expenseSnapshot?.docs
        .map(doc => (doc.data() as Transaction)['amount'] || 0) // Replace 'amount' with your field name
        .reduce((sum, amount) => sum + amount, 0);

      const remainingBalance = (totalIncome ?? 0) - (totalExpense ?? 0);
      // Update user document with totals
      await this.fireStore
        .collection('users')
        .doc(user.id)
        .update({
          totalIncome,
          totalExpense,
          remainingBalance,
        });
    } catch (error) {
      console.error('Error updating totals:', error);
      throw error;
    }
  }

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

  getExpenseTypeDetail(id: string) {
    return this.fireStore.collection('types').doc(id).get().toPromise();
  }

  saveExpenseType(payload: any, id?: any) {
    if(id) {
      return this.fireStore.collection('types').doc(id).update(payload);
    } else {
      return this.fireStore.collection('types').add(payload);
    }
  }
  
  async deleteExpenseType(id: string) {
    return this.fireStore.collection('types').doc(id).delete();
  }

  getExpenses(userId: string, month?: any) {
    let query = this.fireStore.collection('users').doc(userId).collection('expenses');
    if(month?.length) {
      query = this.fireStore.collection('users').doc(userId).collection('expenses', ref => ref.where('month', 'in', month));
    }
    return query.snapshotChanges()
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

  getExpenseDetail(id: string) {
    return this.fireStore.collection('expenses').doc(id).get().toPromise();
  }
  
  async saveExpense(payload: any, id?: any) {
    if(id) {
      const response = await this.fireStore.collection('users').doc(payload.user.id).collection('expenses').doc(id).update(payload);
      await this.updateUserRemainingBalance();
      return this.fireStore.collection('expenses').doc(id).update(payload);
    } else {
      const response = await this.fireStore.collection('users').doc(payload.user.id).collection('expenses').add(payload);
      await this.updateUserRemainingBalance();
      return this.fireStore.collection('expenses').doc(response.id).set(payload);
    }
  }

  async deleteExpense(id: string, userId: string) {
    await this.fireStore.collection('users').doc(userId).collection('expenses').doc(id).delete();
    const expense =await this.fireStore.collection('expenses').doc(id).delete();
    await this.updateUserRemainingBalance();
  }

  getIncomes(userId: string, month?: any) {
    let query = this.fireStore.collection('users').doc(userId).collection('incomes');
    if(month?.length) {
      query = this.fireStore.collection('users').doc(userId).collection('incomes', ref => ref.where('month', 'in', month));
    }
    return query.snapshotChanges()
    .pipe(
      map((actions) => {
        const incomes = actions.map((a) => {
          const data: any = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { ...data, id};
        });
        return incomes;
      })
    );
  }

  getIncomeDetail(id: string) {
    return this.fireStore.collection('incomes').doc(id).get().toPromise();
  }

  async saveIncome(payload: any, id?: any) {
    if(id) {
      const response = await this.fireStore.collection('users').doc(payload.user.id).collection('incomes').doc(id).update(payload);
      await this.updateUserRemainingBalance();
      return this.fireStore.collection('incomes').doc(id).update(payload);
    } else {
      const response = await this.fireStore.collection('users').doc(payload.user.id).collection('incomes').add(payload);
      await this.updateUserRemainingBalance();
      return this.fireStore.collection('incomes').doc(response.id).set(payload);
    }
  }

  async deleteIncome(id: string, userId: string) {
    await this.fireStore.collection('users').doc(userId).collection('incomes').doc(id).delete();
    await this.fireStore.collection('incomes').doc(id).delete();
    await this.updateUserRemainingBalance();
  }

  getUserWallets(userId: string) {
    return this.fireStore.collection('users').doc(userId).collection('wallets').snapshotChanges()
    .pipe(
      map((actions) => {
        const bankAccounts = actions.map((a) => {
          const data: any = a.payload.doc.data();
          const id = a.payload.doc.id;
          return { ...data, id};
        });
        return bankAccounts;
      })
    );
  }

  getWalletDetail(id: string) {
    return this.fireStore.collection('wallets').doc(id).get().toPromise();
  }

  saveWallet(payload: any, id?: any) {
    if(id) {
      return this.fireStore.collection('users').doc(payload.user.id).collection('wallets').doc(id).update(payload);
    } else {
      return this.fireStore.collection('users').doc(payload.user.id).collection('wallets').add(payload);
    }
  }

  deleteWallet(id: string, userId: string) {
    return this.fireStore.collection('users').doc(userId).collection('wallets').doc(id).delete();
  }

  updateWallet(id: string, userId: string, balance: number) {
    return this.fireStore.collection('users').doc(userId).collection('wallets').doc(id).update({ balance });
  }
}
