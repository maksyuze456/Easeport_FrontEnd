export type NotificationType = "Ticket" | "Message" | "Other";

export type Notification = {
    id: number;
    userId: number;
    type: string;
    payload: string;
    createdAt: string;
    read: boolean;
};

export type NotificationResponse = {
    message: string;
    data: Notification[];
};

