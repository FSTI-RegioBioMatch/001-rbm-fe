import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { catchError, switchMap, map, of } from 'rxjs';
import { GustarService } from '../../shared/services/gustar.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-recepie-details-dialog',
  standalone: true,
  imports: [MatButtonModule, MatProgressSpinner],
  templateUrl: './recepie-details-dialog.component.html',
  styleUrls: ['./recepie-details-dialog.component.scss']
})
export class RecepieDetailsDialogComponent implements OnInit {
  loading = true;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
  }
}
