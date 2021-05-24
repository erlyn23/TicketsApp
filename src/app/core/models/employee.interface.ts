import { IEmployeeComments } from "./employee-comments.interface";

export interface IEmployee{
    key?: string;
    fullName: string;
    employeeSpecialty: string;
    clientsInTurn: number;
    rating: number;
    comments: IEmployeeComments[];
}