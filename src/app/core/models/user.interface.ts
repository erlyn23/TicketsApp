export interface IUser{
    fullName: string;
    email: string;
    password: string;
    businessName?: string;
    address?:string;
    photo?: string;
    isBusiness?: boolean;
}