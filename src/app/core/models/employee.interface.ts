import { IEmployeeComments } from "./employee-comments.interface";

export interface IEmployee{
    key?: string;
    fullName: string;
    clientsInTurn: number;
    rating: number;
    comments: IEmployeeComments[];
}