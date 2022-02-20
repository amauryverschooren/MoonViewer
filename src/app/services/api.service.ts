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
  serverData?:  Observable<IServerData>;
  private stopPolling = new Subject();

  constructor(public http: HttpClient) { 
    this.printerData = timer(1, 3000).pipe(
      switchMap(()=> this.getData()),
      retry(),
      share(),
      takeUntil(this.stopPolling)
    )
    this.serverData = timer(1, 3000).pipe(
      switchMap(()=> this.getPrinterInfo()),
      retry(),
      share(),
      takeUntil(this.stopPolling)
    )
  }

  public login(usernameLogin: string, passwordLogin: string){
    const httpOptions = {
    };
    return this.http.post<IResult>(`${this.url}/access/login`, {username: usernameLogin, password: passwordLogin}, httpOptions)
  }
  public checkUserStatus(){
    return this.http.post<IRefreshData>(`${this.url}/access/refresh_jwt`, {refresh_token: localStorage.getItem("refresh_token")})
  }
  public getData(){

    return this.http.get<IPrinterData>(`${this.url}/server/temperature_store`, { headers: this.getToken() })
  }
  public getPrinterInfo(){
    return this.http.get<IServerData>(`${this.url}/printer/info`, { headers: this.getToken() })
  }
  public GCodeCommandStart(){
    const params = new HttpParams()
    .set('script', 'G91')
    return this.http.post<IGcode>(`${this.url}/printer/gcode/script`,{},{headers: this.getToken(),params: params})
  }
  public GCodeCommand(command: string){
    
    const params = new HttpParams()
    .set('script', command)
    
    
    //this.http.post(`${this.url}/printer/gcode/script`, { headers: this.getToken() }, {params: paramsG91})
    return this.http.post<IGcode>(`${this.url}/printer/gcode/script`,{},{headers: this.getToken(),params: params})
   }
  private getToken(): HttpHeaders{
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
export interface ICheckUserErrorRoot{
  error:ICheckUserError;
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
interface TemperatureSensorRaspberryPi{
  temperatures: number[];
}
interface TemperatureSensorMcuTemp{
  temperatures: number[];
}
interface IResultData {
  extruder: Extruder;
  heater_bed: HeaterBed;
  'temperature_sensor raspberry_pi': TemperatureSensorRaspberryPi;
  'temperature_sensor mcu_temp': TemperatureSensorMcuTemp;
}
export interface IPrinterData{
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
export interface IServerData{
  result: IResultServerData

}
interface IResultServerData{
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
export interface ITemps{
  nozzleCurrent: number;
  nozzleTarget: number;
  bedCurrent: number;
  bedTarget: number;
  mcuCurrent: number;
  piCurrent: number;

}

//* Gcode interfaces
export interface IGcode{
  result: string;
}