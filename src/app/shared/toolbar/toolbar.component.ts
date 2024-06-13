import { Component, OnInit } from '@angular/core';
import { MatFabButton, MatIconButton } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { RbmSelectComponent } from '../components/ui/rbm-select/rbm-select.component';
import { MatDialog } from '@angular/material/dialog';
import { ChangeCompanyDialogComponent } from '../components/change-company-dialog/change-company-dialog.component';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  standalone: true,
  imports: [
    MatFabButton,
    RouterLink,
    RbmSelectComponent,
    MatIconButton,
    MatIcon,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
  ],
})
export class ToolbarComponent implements OnInit {
  constructor(
    private route: Router,
    public dialog: MatDialog,
  ) {}

  ngOnInit(): void {}

  onClickOpenChangeCompanyDialog() {
    const dialogRef = this.dialog.open(ChangeCompanyDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
    });
  }
}
