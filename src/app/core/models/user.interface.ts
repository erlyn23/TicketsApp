export interface IUser{
    userId?: number;
    fullName: string;
    email: string;
    password: string;
    businessName?: string;
    openTime?: string;
    closeTime?: string;
    long?: number;
    latitude?: number;
    photo?: string;
    isBusiness?: boolean;
    isInTurn?: boolean;
}