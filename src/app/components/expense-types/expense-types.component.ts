import { Component, OnInit } from '@angular/core';
import { DataService } from '../../shared/services/data.service';
import { ExpenseTypeIcons } from '../../shared/enum/enum';
import { SharedModule } from '../../shared/shared.module';

@Component({
  selector: 'app-expense-types',
  imports: [
    SharedModule
  ],
  templateUrl: './expense-types.component.html',
  styleUrl: './expense-types.component.scss'
})
export class ExpenseTypesComponent implements OnInit{

  expenseTypes: any[] = [];
  icons = ExpenseTypeIcons;
  isLoading = false;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
      this.getExpenseTypes();
  }
  
  getIcon(type: string | undefined): string {
    return type && type in ExpenseTypeIcons 
      ? ExpenseTypeIcons[type as keyof typeof ExpenseTypeIcons] 
      : '/icons/default.png'; // Provide a fallback
  }

  getExpenseTypes() {
    this.isLoading = true;
    this.dataService.getExpenseTypes().subscribe((data) => {
      this.expenseTypes = data;
      this.isLoading = false;
      console.log(this.expenseTypes);
    });
  }

}
