import { Notification, NotificationResponse } from "../types";
import { client } from "../../../lib/api/axiosClient";

export async function getNotifications(userId: number | undefined): Promise<Notification[]> {
  const { data } = await client.get<NotificationResponse>(`/users/${userId}/notifications`);
  return data.data;
}
