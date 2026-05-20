import { Routes } from '@angular/router';
import { SplashComponent } from './components/splash/splash.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guard/auth.guard';
import { ExpenseTypesComponent } from './components/expense-types/expense-types.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { TransactionsCreateComponent } from './components/transactions/transactions-create/transactions-create.component';
import { WalletComponent } from './components/wallet/wallet.component';
import { ExpenseTypesCreateComponent } from './components/expense-types/expense-types-create/expense-types-create.component';
import { IncomeCreateComponent } from './components/wallet/income-create/income-create.component';
import { ReportComponent } from './components/report/report.component';
import { ProfileComponent } from './components/profile/profile.component';
import { WalletCreateComponent } from './components/wallet/wallet-create/wallet-create.component';
import { SavingsListComponent } from './components/savings/savings-list/savings-list.component';
import { SavingsFormComponent } from './components/savings/savings-form/savings-form.component';
import { SavingsAnalyticsComponent } from './components/savings/savings-analytics/savings-analytics.component';
import { ExpenseTrackerComponent } from './components/expense-tracker/expense-tracker.component';

export const routes: Routes = [
    {
        path: '',
        component: SplashComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'expense-types',
        component: ExpenseTypesComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'expense-types/add',
        component: ExpenseTypesCreateComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'expense-types/edit/:id',
        component: ExpenseTypesCreateComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'expenses',
        component: TransactionsComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'expenses/add',
        component: TransactionsCreateComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'expenses/edit/:id',
        component: TransactionsCreateComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'wallet',
        component: WalletComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'wallet/add',
        component: WalletCreateComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'wallet/edit/:id',
        component: WalletCreateComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'incomes/add',
        component: IncomeCreateComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'incomes/edit/:id',
        component: IncomeCreateComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'reports',
        component: ReportComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'savings',
        component: SavingsListComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'savings/add',
        component: SavingsFormComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'savings/edit/:id',
        component: SavingsFormComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'savings/analytics',
        component: SavingsAnalyticsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'expense-tracker',
        component: ExpenseTrackerComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard]
    },
];
