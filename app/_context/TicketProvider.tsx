"use client";

import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import { Ticket, TicketStatus } from "../_types/tickets";
import { Message, Answer } from "../_types/message";
import { ApiResult } from "../api/utils/response";


export interface TicketContextType {
    tickets: Ticket[] | null;
    myTickets: Ticket[] | null;
    singleTicket: Ticket | undefined;

    refetch: (ticketStatus: TicketStatus) => Promise<void>;
    refetchSingleTicket: (ticketId: number) => Promise<void>;
    setAnswer: (answer: Answer, ticketId: number) => Promise<Answer>;
    assignTicket: (ticketId: number) => Promise<void>;
    refetchMyTickets: (ticketStatus: TicketStatus) => Promise<void>;
    closeTicket: (ticketId: number) => Promise<Message>;
    sendAnswer: (ticketId: number, ticketMessageId?: number) => Promise<Message>;
}

import {
    getTicketsByStatus,
    getTicketById,
    getMyTickets,
    assignTicket,
    setAnswer,
    sendAnswer,
    closeTicket
} from "../api/routes/tickets/tickets";

const TicketContext = createContext<TicketContextType>({
    tickets: null,
    myTickets: null,
    singleTicket: undefined,

    refetch: async () => { },
    refetchSingleTicket: async () => { },
    setAnswer: async (): Promise<Answer> => {
        return { message: "" };
    },
    refetchMyTickets: async () => { },
    assignTicket: async () => { },
    closeTicket: async () => {
        return { message: "" };
    },
    sendAnswer: async () => {
        return { message: "" };
    },
});

export function TicketProvider({ children }: { children: React.ReactNode }) {
    const [tickets, setTickets] = useState<Ticket[] | null>(null);
    const [currentStatus, setCurrentStatus] = useState<TicketStatus>("Open");
    const [myTickets, setMyTickets] = useState<Ticket[] | null>(null);
    const [singleTicket, setSingleTicket] = useState<Ticket>();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";


    const fetchTickets = async (ticketStatus: TicketStatus) => {

        const result = await getTicketsByStatus(ticketStatus);

        if (!result.ok) {
            console.error(result.error);
            return;
        }

        setTickets(result.data);
        setCurrentStatus(ticketStatus);

    };

    const fetchTicket = async (ticketId: number) => {

        const result = await getTicketById(ticketId);

        if (!result.ok) {
            console.error(result.error);
            return;
        }

        setSingleTicket(result.data);
    };

    const fetchMyTickets = async (ticketStatus: TicketStatus) => {

        const result = await getMyTickets(ticketStatus);

        if (!result.ok) {
            console.error(result.error);
            return;
        }

        setMyTickets(result.data);
    };

    const fetchAssignTicket = async (ticketId: number) => {
        const result = await assignTicket(ticketId);
        if (!result.ok) {
            console.error(result.error);
            return;
        }
        fetchTickets(currentStatus);
    };

    const fetchSetAnswer = async (
        answer: Answer,
        ticketId: number
    ): Promise<Answer> => {
        const result = await setAnswer(answer, ticketId);

        if (!result.ok) {
            console.log(result);
            console.error(result.error);
            throw new Error(result.error);
        }

        return result.data;
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

    const fetchCloseTicket = async (ticketId: number) => {
        const result = await closeTicket(ticketId);

        if (!result.ok) {
            console.error(result.error);
            throw new Error(result.error);
        }

        return result.data;
    };

    useEffect(() => {
        if (!tickets) fetchTickets(currentStatus);
    }, []);

    return (
        <TicketContext.Provider
            value={{
                tickets: tickets,
                myTickets: myTickets,
                singleTicket: singleTicket,
                refetch: fetchTickets,
                refetchSingleTicket: fetchTicket,
                setAnswer: fetchSetAnswer,
                refetchMyTickets: fetchMyTickets,
                assignTicket: fetchAssignTicket,
                closeTicket: fetchCloseTicket,
                sendAnswer: fetchSendAnswer,
            }}
        >
            {children}
        </TicketContext.Provider>
    );
}

export function useTickets() {
    return useContext(TicketContext);
}
