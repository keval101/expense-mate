import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import { map, Observable } from 'rxjs';
import {
  CreateSavingsDto,
  Savings,
  SavingsFilter,
  UpdateSavingsDto,
} from '../models/savings.model';
import { Wallet } from '../models/wallet.model';
import {
  formatDisplayDate,
  legacyMonthKey,
  startOfDay,
  toMonthKey,
} from '../utils/date.utils';

import { DataService } from './data.service';

@Injectable({ providedIn: 'root' })
export class SavingsService {
  constructor(
    private fireStore: AngularFirestore,
    private dataService: DataService
  ) {}

  getSavings(userId: string, filter?: SavingsFilter): Observable<Savings[]> {
    let query = this.fireStore.collection(`users/${userId}/savings`, (ref) => {
      let q: firebase.firestore.Query = ref;
      if (filter?.types?.length === 1) {
        q = q.where('type', '==', filter.types[0]);
      }
      return q.orderBy('dateTs', 'desc');
    });

    return query.snapshotChanges().pipe(
      map((actions) => {
        let items = actions.map((a) => {
          const data = a.payload.doc.data() as Savings;
          return { ...data, id: a.payload.doc.id };
        });

        if (filter?.monthKeys?.length) {
          items = items.filter((s) => filter.monthKeys!.includes(s.monthKey));
        }

        if (filter?.types && filter.types.length > 1) {
          items = items.filter((s) => filter.types!.includes(s.type));
        }

        return items;
      })
    );
  }

  getSavingsOnce(userId: string): Promise<Savings[]> {
    return this.fireStore
      .collection(`users/${userId}/savings`)
      .get()
      .toPromise()
      .then((snapshot) =>
        snapshot?.docs.map((doc) => ({ ...(doc.data() as Savings), id: doc.id })) ?? []
      )
      .catch(() => []);
  }

  getSavingsById(userId: string, id: string): Promise<Savings | null> {
    return this.fireStore
      .collection(`users/${userId}/savings`)
      .doc(id)
      .get()
      .toPromise()
      .then((doc) => (doc?.exists ? ({ ...(doc.data() as Savings), id: doc.id } as Savings) : null));
  }

  async createSavings(userId: string, dto: CreateSavingsDto): Promise<Savings> {
    const db = this.fireStore.firestore;
    const savingsRef = db.collection(`users/${userId}/savings`).doc();
    const walletRef = db.collection(`users/${userId}/wallets`).doc(dto.walletId);

    return db.runTransaction(async (transaction) => {
      const walletSnap = await transaction.get(walletRef);
      if (!walletSnap.exists) {
        throw new Error('Wallet not found');
      }

      const wallet = { id: walletSnap.id, ...walletSnap.data() } as Wallet;
      if (wallet.balance < dto.amount) {
        throw new Error('Insufficient wallet balance');
      }

      const date = startOfDay(dto.date);
      const savings: Savings = {
        id: savingsRef.id,
        userId,
        title: dto.title,
        amount: dto.amount,
        walletId: dto.walletId,
        walletName: wallet.name,
        date: formatDisplayDate(date),
        dateTs: date.getTime(),
        monthKey: toMonthKey(date),
        note: dto.note ?? '',
        type: dto.type,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      transaction.update(walletRef, {
        balance: wallet.balance - dto.amount,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      transaction.set(savingsRef, savings);

      return savings;
    }).then(async (savings) => {
      await this.dataService.updateUserRemainingBalance();
      return savings;
    });
  }

  async updateSavings(userId: string, id: string, dto: UpdateSavingsDto, previous: Savings): Promise<void> {
    const db = this.fireStore.firestore;
    const savingsRef = db.collection(`users/${userId}/savings`).doc(id);

    const newAmount = dto.amount ?? previous.amount;
    const newWalletId = dto.walletId ?? previous.walletId;
    const newDate = dto.date ? startOfDay(dto.date) : new Date(previous.dateTs);
    const walletChanged = newWalletId !== previous.walletId;
    const amountChanged = newAmount !== previous.amount;

    if (!walletChanged && !amountChanged && !dto.date && !dto.title && !dto.note && !dto.type) {
      return;
    }

    await db.runTransaction(async (transaction) => {
      if (walletChanged || amountChanged) {
        const oldWalletRef = db.collection(`users/${userId}/wallets`).doc(previous.walletId);
        const oldWalletSnap = await transaction.get(oldWalletRef);
        if (oldWalletSnap.exists) {
          const oldWallet = oldWalletSnap.data() as Wallet;
          transaction.update(oldWalletRef, {
            balance: oldWallet.balance + previous.amount,
          });
        }

        const newWalletRef = db.collection(`users/${userId}/wallets`).doc(newWalletId);
        const newWalletSnap = await transaction.get(newWalletRef);
        if (!newWalletSnap.exists) {
          throw new Error('Wallet not found');
        }
        const newWallet = newWalletSnap.data() as Wallet;
        if (newWallet.balance < newAmount) {
          throw new Error('Insufficient wallet balance');
        }
        transaction.update(newWalletRef, {
          balance: newWallet.balance - newAmount,
        });
      } else if (amountChanged) {
        const walletRef = db.collection(`users/${userId}/wallets`).doc(previous.walletId);
        const walletSnap = await transaction.get(walletRef);
        if (!walletSnap.exists) throw new Error('Wallet not found');
        const wallet = walletSnap.data() as Wallet;
        const diff = newAmount - previous.amount;
        if (wallet.balance < diff) throw new Error('Insufficient wallet balance');
        transaction.update(walletRef, { balance: wallet.balance - diff });
      }

      const updatePayload: Partial<Savings> = {
        updatedAt: firebase.firestore.FieldValue.serverTimestamp() as unknown as undefined,
      };

      if (dto.title !== undefined) updatePayload.title = dto.title;
      if (dto.amount !== undefined) updatePayload.amount = dto.amount;
      if (dto.walletId !== undefined) {
        updatePayload.walletId = dto.walletId;
        const walletSnap = await transaction.get(
          db.collection(`users/${userId}/wallets`).doc(newWalletId)
        );
        updatePayload.walletName = walletSnap.data()?.['name'];
      }
      if (dto.note !== undefined) updatePayload.note = dto.note;
      if (dto.type !== undefined) updatePayload.type = dto.type;
      if (dto.date) {
        updatePayload.date = formatDisplayDate(newDate);
        updatePayload.dateTs = newDate.getTime();
        updatePayload.monthKey = toMonthKey(newDate);
      }

      transaction.update(savingsRef, updatePayload);
    }).then(async () => {
      await this.dataService.updateUserRemainingBalance();
    });
  }

  async deleteSavings(userId: string, savings: Savings): Promise<void> {
    const db = this.fireStore.firestore;
    const savingsRef = db.collection(`users/${userId}/savings`).doc(savings.id);
    const walletRef = db.collection(`users/${userId}/wallets`).doc(savings.walletId);

    await db.runTransaction(async (transaction) => {
      const walletSnap = await transaction.get(walletRef);
      if (walletSnap.exists) {
        const wallet = walletSnap.data() as Wallet;
        transaction.update(walletRef, { balance: wallet.balance + savings.amount });
      }
      transaction.delete(savingsRef);
    }).then(async () => {
      await this.dataService.updateUserRemainingBalance();
    });
  }

  /** Legacy month format used by existing report accordion */
  toLegacyMonth(monthKey: string): string {
    const [year, month] = monthKey.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return legacyMonthKey(date);
  }
}
