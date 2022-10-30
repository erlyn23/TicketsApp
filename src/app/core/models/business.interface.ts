import { IEmployee } from "./employee.interface";
import { ITurnLimit } from "./turn-limit.interface";

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
    turnLimits: ITurnLimit[];
    isOpened: boolean;
    notificationToken?: string;
    turnDiaryLimit?: number;
}