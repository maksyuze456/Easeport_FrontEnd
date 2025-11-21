import { Message } from "../../_types/message";
import { client } from "../client";
import { TicketMessage } from "../../_types/tickets";
import { normalizeResponse, ApiResult } from "../utils/response";

export async function getConversation(ticketId: number): Promise<ApiResult<TicketMessage[]>> {
    try {
        const { data } = await client.get(`/ticketMessages/getConversation/${ticketId}`);
        return normalizeResponse<TicketMessage[]>(data);
    } catch (err: any) {
        return normalizeResponse<TicketMessage[]>(
            err.response?.data,
            err.response?.status
        );
    }
}
