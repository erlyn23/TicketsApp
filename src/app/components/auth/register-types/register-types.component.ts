import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register-types',
  templateUrl: './register-types.component.html',
  styleUrls: ['./register-types.component.scss'],
})
export class RegisterTypesComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {}

  goToPage(page: string){
    this.router.navigate([page]);
  }
}
