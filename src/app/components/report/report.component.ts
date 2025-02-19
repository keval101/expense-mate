import { Component, ViewEncapsulation } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { DataService } from '../../shared/services/data.service';
import { CommonModule, DatePipe } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { ExpenseTypeIcons } from '../../shared/enum/enum';

@Component({
  selector: 'app-report',
  imports: [
    CommonModule,
    AccordionModule
    // RouterModule,
    // SharedModule,
    // DrawerModule,
  ],
  providers: [DatePipe],
  templateUrl: './report.component.html',
  styleUrl: './report.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ReportComponent {

  user: any;
  isLoading = false;
  allExpenses: any[] = [];
  allIncomes: any[] = [];
  expenses: any[] = [];
  incomes: any[] = [];
  filterValue: any = {};
  totalExpense = 0
  selectedItem: any = {};
  searchValue = '';
  groupedExpenses: any[] = [];
  groupedIncomes: any[] = [];
  totalIncome: number = 0;
  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private datepipe: DatePipe
  ) {
    this.authService.getCurrentUserDetail().then(user => {
      this.user = user;
      this.getIncomes();
      this.getExpenses();
    })
  }

    getIcon(type: string | undefined): string {
      return type && type in ExpenseTypeIcons
        ? ExpenseTypeIcons[type as keyof typeof ExpenseTypeIcons]
        : '/icons/others.svg';
    }

  getExpenses() {
    this.isLoading = true;
    this.dataService.getExpenses(this.user.id).subscribe(expenses => {
      this.isLoading = false;
      this.expenses = expenses;
      this.allExpenses = JSON.parse(JSON.stringify(expenses));
      const month = this.datepipe.transform(new Date(), 'MMM, yyyy');
      console.log(this.expenses);
      this.grupExpensesByMonth();
      // if(this.searchValue) {
      //   this.onSearch(this.searchValue);
      // }
      // this.setTotalExpense();
    })
  }

  grupExpensesByMonth() {
    const data: any[] = []
    const groupedExpenses = this.allExpenses.reduce((acc, expense) => {
      const month = expense.month;
      if (!acc[month]) {
        acc[month] = [];
        data.push({
          month: month,
          expenses: []
        });
      }
      const index = data.findIndex(item => item.month === month);
      data[index].expenses.push(expense);
      acc[month].push(expense);
      return acc;
    }, {} as Record<string, any[]>);

    data.forEach(x => {
      x['topSpending'] = this.getTopSpending(x.expenses);
      x['totalExpense'] = x.expenses?.reduce((sum: any, item: any) => sum + (item.amount || 0), 0) || 0;
      const savings = x.expenses?.filter((y: any) => y.type.type === 'savings');
      x['totalSavings'] = savings?.reduce((sum: any, item: any) => sum + (item.amount || 0), 0) || 0;
    })
    this.groupedExpenses = data;
    console.log(this.groupedExpenses)    
  }

  grupIncomesByMonth() {
    const data: any[] = []
    const groupedIncomes = this.allIncomes.reduce((acc, income) => {
      const month = income.month;
      if (!acc[month]) {
        acc[month] = [];
        data.push({
          month: month,
          incomes: []
        });
      }
      const index = data.findIndex(item => item.month === month);
      data[index].incomes.push(income);
      acc[month].push(income);
      return acc;
    }, {} as Record<string, any[]>);

    data.forEach(x => {
      x['totalIncome'] = x.incomes?.reduce((sum: any, item: any) => sum + (item.amount || 0), 0) || 0; 
    })
    this.groupedIncomes = data;
    console.log('groupedIncomes', this.allIncomes, groupedIncomes, this.groupedIncomes)    
  }

  getTopSpending(expenses: any[]) {
    let sortedExpenses = expenses.sort((a, b) => b.amount - a.amount);
    sortedExpenses = sortedExpenses.filter(expense => expense.type.type != 'savings' && expense.type.type != 'emi' && expense.type.type != 'pocketMoney'); 
    console.log('sortedExpenses', sortedExpenses);
    return sortedExpenses[0];
  }

  getIncomes() {
    this.isLoading = true;
    const month = this.datepipe.transform(new Date(), 'MMM, yyyy');
    this.dataService.getIncomes(this.user.id).subscribe((incomes) => {
      this.isLoading = false;
      this.allIncomes = JSON.parse(JSON.stringify(incomes));
      this.grupIncomesByMonth();
    });
  }

  getMonthIncome(month: string) {
    const income = this.groupedIncomes.find(x => x.month === month);
    return income?.totalIncome || 0;
  }
  
  onFilter() {

  }
}
