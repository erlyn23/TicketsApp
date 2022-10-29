import { INotification } from "./notification.interface";

export interface INotificationBody{
    notification: INotification;
    token: string;
}