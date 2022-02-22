import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, delay, Observable, retry, share, Subject, switchMap, takeUntil, timer } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService implements OnDestroy {
  url: string = 'http://192.168.1.30:7125'
  loggedInUser: any;
  printerData?: Observable<IPrinterData>;
  serverData?: Observable<IServerData>;
  private stopPolling = new Subject();

  constructor(public http: HttpClient) {
    this.printerData = timer(1, 3000).pipe(
      switchMap(() => this.getData()),
      retry(),
      share(),
      takeUntil(this.stopPolling)
    )
    this.serverData = timer(1, 3000).pipe(
      switchMap(() => this.getPrinterInfo()),
      retry(),
      share(),
      takeUntil(this.stopPolling)
    )
  }

  public login(usernameLogin: string, passwordLogin: string) {
    const httpOptions = {
    };
    return this.http.post<IResult>(`${this.url}/access/login`, { username: usernameLogin, password: passwordLogin }, httpOptions)
  }
  public checkUserStatus() {
    return this.http.post<IRefreshData>(`${this.url}/access/refresh_jwt`, { refresh_token: localStorage.getItem("refresh_token") })
  }
  public getData() {
    return this.http.get<IPrinterData>(`${this.url}/server/temperature_store`, { headers: this.getToken() })
  }
  public getPrinterInfo() {
    return this.http.get<IServerData>(`${this.url}/printer/info`, { headers: this.getToken() })

  }
  public GCodeCommandStart() {
    const params = new HttpParams()
      .set('script', 'G91')
    return this.http.post<IGcode>(`${this.url}/printer/gcode/script`, {}, { headers: this.getToken(), params: params })
  }
  public getFiles() {
    return this.http.get<IGcodeFilesRoot>(`${this.url}/server/files/list`, { headers: this.getToken() })
  }
  public GCodeCommand(command: string) {
    const params = new HttpParams()
      .set('script', command)
    return this.http.post<IGcode>(`${this.url}/printer/gcode/script`, {}, { headers: this.getToken(), params: params })
  }
  public getGcodeMetadata(fileName: string) {
    const params = new HttpParams()
      .set('filename', fileName)
    return this.http.get<IGcodeMetadataRoot>(`${this.url}/server/files/metadata`, { headers: this.getToken(), params: params })
  }
  public downloadThumbnail(path: string): Observable<Blob>{
    return this.http.get(`${this.url}/server/files/gcode_files/${path}`, { headers: this.getToken(), responseType: 'blob' })
  }
  public printFile(file: string){
    const params = new HttpParams()
    .set('filename', file)
    return this.http.post<IPrintFileResult>(`${this.url}/printer/print/start`, {}, { headers: this.getToken(), params: params })
  }
  public getMachineInfo(){
    return this.http.get<IMachineInfo>(`${this.url}/machine/system_info`, { headers: this.getToken() })
  }
  private getToken(): HttpHeaders {
    const auth_token = localStorage.getItem("token")
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${auth_token}`)
      .set('Content-Type', 'application/json')
    return headers;
  }
  ngOnDestroy() {
    this.stopPolling.next(1);
  }


}



//* ionterface refresh token
export interface loginResult {
  username: string;
  token: string;
  refresh_token: string;
  action: string;
}
export interface IResult {
  result: loginResult;
}
export interface ICheckUserErrorRoot {
  error: ICheckUserError;
}
export interface ICheckUserError {
  code: number;
  message: string;
  traceback: string;
}

//* Interfaces PrinterData
interface Extruder {
  temperatures: number[];
  targets: number[];
  powers: number[];
}
interface HeaterBed {
  temperatures: number[];
  targets: number[];
  powers: number[];
}
interface TemperatureSensorRaspberryPi {
  temperatures: number[];
}
interface TemperatureSensorMcuTemp {
  temperatures: number[];
}
interface IResultData {
  extruder: Extruder;
  heater_bed: HeaterBed;
  'temperature_sensor raspberry_pi': TemperatureSensorRaspberryPi;
  'temperature_sensor mcu_temp': TemperatureSensorMcuTemp;
}
export interface IPrinterData {
  result: IResultData
}

//* Interface userData
interface IData {
  username: string;
  token: string;
  action: string;
}
export interface IRefreshData {
  result: IData;
}

//* Interfaces PrinterDefaultData
export interface IServerData {
  result: IResultServerData

}
interface IResultServerData {
  state: string;
  state_message: string;
  hostname: string;
  software_version: string;
  cpu_info: string;
  klipper_path: string;
  python_path: string;
  log_file: string;
  config_file: string;
}

//* interface temps
export interface ITemps {
  nozzleCurrent: number;
  nozzleTarget: number;
  bedCurrent: number;
  bedTarget: number;
  mcuCurrent: number;
  piCurrent: number;

}

//* Gcode interfaces
export interface IGcode {
  result: string;
}

//* gcode files
export interface IGcodeFilesRoot {
  result: IGcodeFiles[]
}
interface IGcodeFiles {
  path: string;
  modified: number;
  size: number;
  permissions: string;
}

//* GCode Metadata
export interface IGcodeMetadataRoot {
  result: IGcodeMetadata
}
interface IGcodeMetadata {
  size: number;
  modified: number;
  slicer: string;
  slicer_version: string;
  gcode_start_byte: number;
  gcode_end_byte: number;
  object_height: number;
  estimated_time: number;
  layer_height: number;
  first_layer_height: number;
  first_layer_extr_temp: number;
  first_layer_bed_temp: number;
  filament_total: number;
  thumbnails?: IGcodeThumbnail[];
  print_start_time: number;
  job_id: string;
  filename: string;
}
interface IGcodeThumbnail {
  width: number;
  height: number;
  size: number;
  relative_path: string;
  thumbnailLink?: string;
}

export interface IGcodeRoot {

  file: IGcodeFiles;
  metadata: IGcodeMetadata
}

//* print file result
export interface IPrintFileResult{
  result: string;
}


//* machine info 
export interface CpuInfo {
  cpu_count: number;
  bits: string;
  processor: string;
  cpu_desc: string;
  serial_number: string;
  hardware_desc: string;
  model: string;
  total_memory: number;
  memory_units: string;
}

export interface SdInfo {
  manufacturer_id: string;
  manufacturer: string;
  oem_id: string;
  product_name: string;
  product_revision: string;
  serial_number: string;
  manufacturer_date: string;
  capacity: string;
  total_bytes: number;
}

export interface VersionParts {
  major: string;
  minor: string;
  build_number: string;
}

export interface ReleaseInfo {
  name: string;
  version_id: string;
  id: string;
}

export interface Distribution {
  name: string;
  id: string;
  version: string;
  version_parts: VersionParts;
  like: string;
  codename: string;
  release_info: ReleaseInfo;
}

export interface Virtualization {
  virt_type: string;
  virt_identifier: string;
}

export interface IpAddress {
  family: string;
  address: string;
  is_link_local: boolean;
}

export interface Wlan0 {
  mac_address: string;
  ip_addresses: IpAddress[];
}

export interface Network {
  wlan0: Wlan0;
}

export interface Klipper {
  active_state: string;
  sub_state: string;
}

export interface Webcamd {
  active_state: string;
  sub_state: string;
}

export interface Moonraker {
  active_state: string;
  sub_state: string;
}

export interface ServiceState {
  klipper: Klipper;
  webcamd: Webcamd;
  moonraker: Moonraker;
}

export interface SystemInfo {
  cpu_info: CpuInfo;
  sd_info: SdInfo;
  distribution: Distribution;
  virtualization: Virtualization;
  network: Network;
  available_services: string[];
  service_state: ServiceState;
}

export interface Result {
  system_info: SystemInfo;
}

export interface IMachineInfo {
  result: Result;
}