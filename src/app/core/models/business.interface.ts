import { IEmployee } from "./employee.interface";

export interface IBusiness{
    key?: string;
    businessName: string;
    latitude: number;
    long: number;
    clientsInTurn: number;
    businessPhoto: string;
    employees: IEmployee[];
}