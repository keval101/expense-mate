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
        .map(doc => (doc.data() as Transaction)['amount'] || 0)
        .reduce((sum, amount) => sum + amount, 0);

      const savingsSnapshot = await this.fireStore
        .collection(`users/${user.id}/savings`)
        .get()
        .toPromise();

      const totalSavings = savingsSnapshot?.docs
        .map(doc => (doc.data() as Transaction)['amount'] || 0)
        .reduce((sum, amount) => sum + amount, 0) ?? 0;

      const remainingBalance = (totalIncome ?? 0) - (totalExpense ?? 0) - totalSavings;
      // Update user document with totals
      await this.fireStore
        .collection('users')
        .doc(user.id)
        .update({
          totalIncome,
          totalExpense,
          totalSavings,
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

  getExpenseDetail(userId: string, id: string) {
    return this.fireStore
      .collection('users')
      .doc(userId)
      .collection('expenses')
      .doc(id)
      .get()
      .toPromise();
  }
  
  async saveExpense(payload: any, id?: any) {
    const userId = payload.user.id;
    if (id) {
      await this.fireStore
        .collection('users')
        .doc(userId)
        .collection('expenses')
        .doc(id)
        .update(payload);
    } else {
      await this.fireStore
        .collection('users')
        .doc(userId)
        .collection('expenses')
        .add(payload);
    }
    await this.updateUserRemainingBalance();
  }

  async deleteExpense(id: string, userId: string) {
    await this.fireStore.collection('users').doc(userId).collection('expenses').doc(id).delete();
    try {
      await this.fireStore.collection('expenses').doc(id).delete();
    } catch {
      // Root mirror may not exist
    }
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

  getIncomeDetail(userId: string, id: string) {
    return this.fireStore
      .collection('users')
      .doc(userId)
      .collection('incomes')
      .doc(id)
      .get()
      .toPromise();
  }

  async saveIncome(payload: any, id?: any) {
    const userId = payload.user.id;
    if (id) {
      await this.fireStore
        .collection('users')
        .doc(userId)
        .collection('incomes')
        .doc(id)
        .update(payload);
    } else {
      await this.fireStore
        .collection('users')
        .doc(userId)
        .collection('incomes')
        .add(payload);
    }
    await this.updateUserRemainingBalance();
  }

  async deleteIncome(id: string, userId: string) {
    await this.fireStore.collection('users').doc(userId).collection('incomes').doc(id).delete();
    try {
      await this.fireStore.collection('incomes').doc(id).delete();
    } catch {
      // Legacy root mirror may not exist
    }
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

  getUserWalletById(userId: string, walletId: string): Promise<{ id: string; balance: number; [key: string]: any } | null> {
    return this.fireStore
      .collection('users')
      .doc(userId)
      .collection('wallets')
      .doc(walletId)
      .get()
      .toPromise()
      .then((doc) => (doc?.exists ? { id: doc.id, ...(doc.data() as object) } as any : null));
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

  async reverseExpenseWalletChanges(userId: string, expense: any): Promise<void> {
    if (expense?.wallet?.id) {
      const wallet = await this.getUserWalletById(userId, expense.wallet.id);
      if (wallet) {
        await this.updateWallet(expense.wallet.id, userId, wallet.balance + (expense.amount ?? 0));
      }
    }

    if (expense?.selfTransfer && expense?.selfTransferWallet?.id) {
      const wallet = await this.getUserWalletById(userId, expense.selfTransferWallet.id);
      if (wallet) {
        await this.updateWallet(expense.selfTransferWallet.id, userId, wallet.balance - (expense.amount ?? 0));
      }
    }
  }

  async applyExpenseWalletChanges(userId: string, expense: any): Promise<void> {
    if (expense?.wallet?.id) {
      const wallet = await this.getUserWalletById(userId, expense.wallet.id);
      if (wallet) {
        await this.updateWallet(expense.wallet.id, userId, wallet.balance - (expense.amount ?? 0));
      }
    }

    if (expense?.selfTransfer && expense?.selfTransferWallet?.id) {
      const wallet = await this.getUserWalletById(userId, expense.selfTransferWallet.id);
      if (wallet) {
        await this.updateWallet(expense.selfTransferWallet.id, userId, wallet.balance + (expense.amount ?? 0));
      }
    }
  }

  async reverseIncomeWalletChanges(userId: string, income: any): Promise<void> {
    if (income?.wallet?.id) {
      const wallet = await this.getUserWalletById(userId, income.wallet.id);
      if (wallet) {
        await this.updateWallet(income.wallet.id, userId, wallet.balance - (income.amount ?? 0));
      }
    }
  }

  async applyIncomeWalletChanges(userId: string, income: any): Promise<void> {
    if (income?.wallet?.id) {
      const wallet = await this.getUserWalletById(userId, income.wallet.id);
      if (wallet) {
        await this.updateWallet(income.wallet.id, userId, wallet.balance + (income.amount ?? 0));
      }
    }
  }
}
