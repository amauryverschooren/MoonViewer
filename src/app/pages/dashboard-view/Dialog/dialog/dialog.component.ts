import { Component, Inject, OnInit } from '@angular/core';
import {MatDialog,MatDialogContent} from '@angular/material/dialog';
import { IGcodeRoot } from 'src/app/services/api.service';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public file: {file: IGcodeRoot},public dialog: MatDialog) { }

  ngOnInit(): void {
  }

}
