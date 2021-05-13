export interface IUser{
    fullName: string;
    email: string;
    password: string;
    businessName?: string;
    long?: number;
    latitude?: number;
    photo?: string;
    isBusiness?: boolean;
}