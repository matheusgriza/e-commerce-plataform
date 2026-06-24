export type CreateNotificationDTO = {
    customerId: string;
    type: string;
    message: string;
};

export type NotificationResponse = {
    id: string;
    customerId: string;
    type: string;
    message: string;
    read: boolean;
    createdAt: string;
};
