import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { lastValueFrom, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //firebase auth
  constructor(
    private fireAuth: AngularFireAuth,
    private fireStore: AngularFirestore,
    private router: Router
  ) { }


  login(email: string, password: string) {
    return this.fireAuth.signInWithEmailAndPassword(email, password)
  }

  register(email: string, password: string) {
    return this.fireAuth.createUserWithEmailAndPassword(email, password)
  }

  logout() {
    this.fireAuth.signOut().then(() => {
      localStorage.clear()
      this.router.navigate(['/login'])
    }, err => {
      alert(err.message)
    })
  }

  async storeUserData(payload: any) {
    if (!payload.id) {
      console.error('Invalid payload: Missing user ID');
      return;
    }
  
    this.fireStore
      .collection('/users')
      .doc(payload.id)
      .set(payload)
      .then(() => {
      })
      .catch((error) => {
        console.error('Error storing user data:', error);
      });
  }
  
  isAuthenticated(): Observable<boolean> {
    return this.fireAuth.authState.pipe(
      map(user => user !== null)
    );
  }

  async getCurrentUserDetail() {
    const userId = localStorage.getItem('userId');

    const userSnapshot = await lastValueFrom(
      this.fireStore
        .collection('users', ref => ref.where('id', '==', userId))
        .get()
    );

    const user: any = userSnapshot.docs.map(doc => {
      const data: any = doc.data();
      const id = doc.id;
      delete data.password
      return { ...data, id };
    });

    return user[0]
  }

}
