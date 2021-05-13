import { IEmployeeComments } from "./employee-comments.interface";

export interface IEmployee{
    fullName: string;
    clientsInTurn: number;
    rating: number;
    comments: IEmployeeComments[];
}