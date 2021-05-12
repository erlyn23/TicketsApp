export interface IUser{
    fullName: string;
    phone: string;
    email: string;
    password: string;
    photo?: string;
    isBusiness?: boolean;
    step?: number;
}