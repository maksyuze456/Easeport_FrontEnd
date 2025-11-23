import { client } from "../../client";
import { TicketMessage } from "../../../_types/tickets";

export async function getConversation(ticketId: number): Promise<TicketMessage[]> {

    const { data } = await client.get(`/ticketMessages/getConversation/${ticketId}`);
    return <TicketMessage[]>(data);

}
