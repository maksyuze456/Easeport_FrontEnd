"use client";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from "react";
import { getConversation } from "../api/routes/tickets/ticketConversation";
import { TicketMessage } from "../_types/tickets";
import { Message } from "../_types/message";
import { sendAnswer } from "../api/routes/tickets/tickets";

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

