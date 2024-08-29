import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ChangeCompanyDialogComponent } from '../components/change-company-dialog/change-company-dialog.component';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  standalone: true,
  imports: [RouterLink, DialogModule, InputTextModule, Button, MenuModule],
})
export class ToolbarComponent implements OnInit {
  visible: boolean = false;

  menuItems: MenuItem[] = [
    {
      label: 'Options',
      items: [
        {
          label: 'Übersicht',
          routerLink: '/dashboard',
        },
        {
          label: 'Rezepte',
          routerLink: '/my-recipes',
        },
        {
          label: 'Menüplanung',
          routerLink: '/menu-planning',
        },
        {
          label: '{Martkplatz}',
          routerLink: '/recipes',
        },
        {
          label: 'Bereich xy',
          routerLink: '/recipes',
        },
      ],
    },
  ];

  constructor(
    private route: Router,
    private dialogService: DialogService,
  ) {}

  ngOnInit(): void {}

  onClickOpenChangeCompanyDialog() {
    const dialogRef = this.dialogService.open(ChangeCompanyDialogComponent, {
      header: 'Firma wechseln',
      width: '40%',
      height: '30%',
    });
  }
}
