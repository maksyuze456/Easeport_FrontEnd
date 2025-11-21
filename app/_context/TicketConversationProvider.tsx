"use client";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { getConversation } from "../api/routes/ticketConversation";
import { TicketMessage } from "../_types/tickets";
import { Message } from "../_types/message";
import { sendAnswer } from "../api/routes/tickets";

const TicketConversationContext = createContext<{
  ticketConversation: TicketMessage[] | [];
  refetchConversation: (
    ticketId: number,
    loadingConversation?: boolean,
    setLoadingConversation?: Dispatch<SetStateAction<boolean>>
  ) => Promise<void>;
  sendAnswer: (ticketId: number, ticketMessageId?: number) => Promise<Message>;
}>({
  ticketConversation: [],
  refetchConversation: async () => { },
  sendAnswer: async () => {
    return { message: "" };
  },
});

export function TicketConversationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ticketConversation, setTicketConversation] = useState<TicketMessage[]>([]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  const fetchConversation = async (ticketId: number) => {

    const result = await getConversation(ticketId);

    if (!result.ok) {
      console.error(result.error);
      setTicketConversation([])
      return;
    }

    setTicketConversation(result.data);
  };

  const fetchSendAnswer = async (
    ticketId: number,
    ticketMessageId?: number
  ): Promise<Message> => {

    const result = await sendAnswer(ticketId, ticketMessageId);

    if (!result.ok) {
      console.error(result.error);
      throw new Error(result.error);
    }

    return result.data;

  };

  return (
    <TicketConversationContext.Provider
      value={{
        ticketConversation: ticketConversation,
        refetchConversation: fetchConversation,
        sendAnswer: fetchSendAnswer,
      }}
    >
      {children}
    </TicketConversationContext.Provider>
  );
}

export function useTicketConversation() {
  return useContext(TicketConversationContext);
}
