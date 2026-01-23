import { Notification, NotificationResponse } from "../../../_types/notifications";
import { client } from "../../client";

export async function getNotifications(userId: number | undefined): Promise<Notification[]> {
    const { data } = await client.get<NotificationResponse>(`/users/${userId}/notifications`);
    return data.data;
}
