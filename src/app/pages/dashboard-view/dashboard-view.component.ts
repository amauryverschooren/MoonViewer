import { Component, OnInit } from '@angular/core';
import {
  ApiService,
  IServerData,
  ITemps,
  IGcodeFilesRoot,
  IGcodeRoot,
  IMachineInfo,
} from 'src/app/services/api.service';
import {MatDialog} from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { firstValueFrom } from 'rxjs';
import { DialogComponent } from './Dialog/dialog/dialog.component';
const tempCurrent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true" class="v-icon__svg" style="font-size: 20px; height: 20px; width: 20px;"><path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.09 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.12 15.47 5.29 15.97C5.43 16.57 5.7 17.17 6 17.7C7.08 19.43 8.95 20.67 10.96 20.92C13.1 21.19 15.39 20.8 17.03 19.32C18.86 17.66 19.5 15 18.56 12.72L18.43 12.46C18.22 12 17.66 11.2 17.66 11.2M14.5 17.5C14.22 17.74 13.76 18 13.4 18.1C12.28 18.5 11.16 17.94 10.5 17.28C11.69 17 12.4 16.12 12.61 15.23C12.78 14.43 12.46 13.77 12.33 13C12.21 12.26 12.23 11.63 12.5 10.94C12.69 11.32 12.89 11.7 13.13 12C13.9 13 15.11 13.44 15.37 14.8C15.41 14.94 15.43 15.08 15.43 15.23C15.46 16.05 15.1 16.95 14.5 17.5H14.5Z"></path></svg>`;
const thermometer = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-hidden="true" class="v-icon__svg" style="font-size: 20px; height: 20px; width: 20px;"><path d="M15 13V5A3 3 0 0 0 9 5V13A5 5 0 1 0 15 13M12 4A1 1 0 0 1 13 5V12H11V5A1 1 0 0 1 12 4Z"></path></svg>`;

@Component({
  selector: 'app-dashboard-view',
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.scss'],
})
export class DashboardViewComponent implements OnInit {
  printerTemps: ITemps = {
    nozzleCurrent: 0,
    nozzleTarget: 0,
    bedCurrent: 0,
    bedTarget: 0,
    mcuCurrent: 0,
    piCurrent: 0,
  };
  serverInfo: IServerData = {
    result: {
      state: '',
      state_message: '',
      hostname: '',
      software_version: '',
      cpu_info: '',
      klipper_path: '',
      python_path: '',
      log_file: '',
      config_file: '',
    },
  };
  gcodefiles: IGcodeFilesRoot = {
    result: [],
  };
  gcodeMetadata: IGcodeRoot[] = [];
  videoUrl!: SafeResourceUrl;
  iframe = document.getElementById('iframe');
  isHomedBed: boolean = false;
  isHomedNozzle: boolean = false;
  serverState: boolean = false;
  imageToShow: any;
  machineInfo!: IMachineInfo;

  constructor(
    private api: ApiService,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    private toastr: ToastrService,
    public dialog: MatDialog
  ) {
    this.api.printerData?.subscribe((result) => {
      this.printerTemps.nozzleCurrent =
        result.result.extruder.temperatures[
          result.result.extruder.temperatures.length - 1
        ];
      this.printerTemps.nozzleTarget =
        result.result.extruder.targets[
          result.result.extruder.targets.length - 1
        ];
      this.printerTemps.bedCurrent =
        result.result.heater_bed.temperatures[
          result.result.heater_bed.temperatures.length - 1
        ];
      this.printerTemps.bedTarget =
        result.result.heater_bed.targets[
          result.result.heater_bed.targets.length - 1
        ];
      this.printerTemps.mcuCurrent =
        result.result['temperature_sensor mcu_temp'].temperatures[
          result.result['temperature_sensor mcu_temp'].temperatures.length - 1
        ];
      this.printerTemps.piCurrent =
        result.result['temperature_sensor raspberry_pi'].temperatures[
          result.result['temperature_sensor raspberry_pi'].temperatures.length -
            1
        ];
    });
    this.GetFiles();
    this.api.getMachineInfo().subscribe(result => {
      this.machineInfo = result
      console.log('machine result',this.machineInfo.result.system_info.available_services);
    })
    this.api.serverData?.subscribe((result) => {
      const oldState = this.serverInfo.result.state;
      this.serverInfo = result;

      if (this.serverInfo.result.state == 'shutdown') {
        this.serverState = true;
      } else if (
        this.serverInfo.result.state == 'startup' &&
        oldState == 'shutdown'
      ) {
        this.toastr.success(
          'Succesfully restored connection with printer!',
          'Printer Status'
        );
        this.serverState = false;
      }
      console.log('info', result);
    });
    iconRegistry.addSvgIconLiteral(
      'thermometer',
      sanitizer.bypassSecurityTrustHtml(thermometer)
    );
    iconRegistry.addSvgIconLiteral(
      'tempCurrent',
      sanitizer.bypassSecurityTrustHtml(tempCurrent)
    );
  }

  async GetFiles() {
    this.gcodefiles = await firstValueFrom(this.api.getFiles());

    const test = this.gcodefiles.result.map(
      async (file) =>
        <IGcodeRoot>{
          file,
          metadata: (await firstValueFrom(this.api.getGcodeMetadata(file.path)))
            .result,
        }
    );
    this.gcodeMetadata = await Promise.all(test);

    console.log('this.gcodeMetadata', this.gcodeMetadata);

    this.gcodeMetadata.forEach((element) => {
      console.log('3');
      console.log('element.metadata', element.metadata);
      if(element.metadata.thumbnails){
        element.metadata.thumbnails[0].thumbnailLink = `http://192.168.1.30/server/files/gcodes/${element.metadata.thumbnails[0].relative_path}`;
      }

      const underscoreCount = (element.file.path.match(/_/g) || []).length;
      for (let i = 0; i < underscoreCount; i++) {
        element.file.path = element.file.path.replace('_', ' ');
      }
      // console.log('imageLink', element.metadata.thumbnails[0].thumbnailLink );
      
    });
  }
  openDialog(file: IGcodeRoot) {
    let dialogRef = this.dialog.open(DialogComponent, {
      data: { file: file },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
      if (result) {
        this.printFile(file.file.path);
      }
    });
  }
  printFile(file: string){

    const underscoreCount = (file.match(/ /g) || []).length;
    for (let i = 0; i < underscoreCount; i++) {
      file = file.replace(' ', '_');
    }
    this.api.printFile(file).subscribe(result => {

        console.log(result);
      if (result.result == 'ok') {
        console.log('okeeeee');
        this.toastr.success(
          'Succesfully selected file to print!',
          'Printer Status'
        );
      }
      
    })
  }
  controlGCode(action: string) {
    if (action == 'links') {
      if (!this.isHomedBed) {
        this.toastr.info('Home first before using this action', 'Warning!');
      } else {
        this.api.GCodeCommandStart().subscribe((result) => {
          if ((result.result = 'ok')) {
            this.api.GCodeCommand('G1 x-10 F1000').subscribe((result) => {
              console.log(result);
            });
          }
        });
      }
    } else if (action == 'omhoogbed') {
      if (!this.isHomedBed) {
        this.toastr.info('Home first before using this action', 'Warning!');
      } else {
        this.api.GCodeCommandStart().subscribe((result) => {
          if ((result.result = 'ok')) {
            this.api.GCodeCommand('G1 y10 F1000').subscribe((result) => {
              console.log(result);
            });
          }
        });
      }
    } else if (action == 'homebed') {
      this.api.GCodeCommandStart().subscribe((result) => {
        if ((result.result = 'ok')) {
          this.api.GCodeCommand('G28 X Y').subscribe((result) => {
            this.isHomedBed = true;
          });
        }
      });
    } else if (action == 'omlaagbed') {
      if (!this.isHomedBed) {
        this.toastr.info('Home first before using this action', 'Warning!');
      } else {
        this.api.GCodeCommandStart().subscribe((result) => {
          if ((result.result = 'ok')) {
            this.api.GCodeCommand('G1 y-10 F1000').subscribe((result) => {
              console.log(result);
            });
          }
        });
      }
    } else if (action == 'rechts') {
      if (!this.isHomedBed) {
        this.toastr.info('Home first before using this action', 'Warning!');
      } else {
        this.api.GCodeCommandStart().subscribe((result) => {
          if ((result.result = 'ok')) {
            this.api.GCodeCommand('G1 x10 F1000').subscribe((result) => {
              console.log(result);
            });
          }
        });
      }
    } else if (action == 'omhoognozzle') {
      if (!this.isHomedNozzle) {
        this.toastr.info('Home first before using this action', 'Warning!');
      } else {
        this.api.GCodeCommandStart().subscribe((result) => {
          if ((result.result = 'ok')) {
            this.api.GCodeCommand('G1 z10 F1000').subscribe((result) => {
              console.log(result);
            });
          }
        });
      }
    } else if (action == 'homenozzle') {
      this.api.GCodeCommandStart().subscribe((result) => {
        if ((result.result = 'ok')) {
          this.api.GCodeCommand('G28 Z').subscribe((result) => {
            this.isHomedNozzle = true;
          });
        }
      });
    } else if (action == 'omlaagnozzle') {
      if (!this.isHomedNozzle) {
        this.toastr.info('Home first before using this action', 'Warning!');
      } else {
        this.api.GCodeCommandStart().subscribe((result) => {
          if ((result.result = 'ok')) {
            this.api.GCodeCommand('G1 z-10 F1000').subscribe((result) => {
              console.log(result);
            });
          }
        });
      }
    }
  }
  ngOnInit() {}
}
