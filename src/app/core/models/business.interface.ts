import { IEmployee } from "./employee.interface";

export interface IBusiness{
    businessName: string;
    latitude: number;
    long: number;
    clientsInTurn: number;
    businessPhoto: string;
    employees: IEmployee[];
}