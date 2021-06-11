import { IEmployee } from "./employee.interface";

export interface IBusiness{
    key?: string;
    businessName: string;
    latitude: number;
    long: number;
    openTime: string;
    closeTime: string;
    clientsInTurn: number;
    businessPhoto: string;
    employees: IEmployee[];
    isOpened: boolean;
}