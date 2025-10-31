'use client';
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';

export type TicketMessage = {
    ticketMessageId: number;
    ticketId: number;
    sender: string;
    body: string;
    localDateTime: string;
    emailMessageId: string;
    inReplyTo: string | null;
};
export type Message = {
    message: string
};

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
    refetchConversation: async () => {},
    sendAnswer: async () => {
        return { message: ''}
    } 
});

export function TicketConversationProvider({ children }: { children: React.ReactNode }) {
    const [ticketConversation, setTicketConversation] = useState<TicketMessage[]>([]);


    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';


    


    const fetchConversation = async (ticketId: number, loadingConversation?: boolean, setLoadingConversation?: Dispatch<SetStateAction<boolean>>) => {
        try {
            
            const res = await fetch(`${apiUrl}/api/ticketMessages/getConversation/${ticketId}`, {
                method: 'GET',
                credentials: 'include'
            });
            const data = await res.json();

            if (!res.ok) {
                console.error('Failed fetching conversation', data);
                setTicketConversation([]);
                return;
            }

            setTicketConversation(data);
            console.log('conversation loaded', data);
        } catch (err) {
            console.error('Error fetching conversation', err);
            setTicketConversation([]);
        }
    };

    const fetchSendAnswer = async ( ticketId: number, ticketMessageId?: number)  => {

        if(ticketMessageId) {
                    try {
                        const res = await fetch(`${apiUrl}/api/tickets/sendAnswer/${ticketId}/reply/${ticketMessageId}`,{
                            method: 'POST',
                            credentials: 'include'
                        });
            
                        const data = await res.json();
            
                        if(!res.ok) throw new Error(data);
            
                        return data as Message;
                    } catch(err) {
                        console.log(err);
                        throw err;
                    }
                } else {
                    try {
                        const res = await fetch(`${apiUrl}/api/tickets/sendAnswer/${ticketId}`,{
                            method: 'POST',
                            credentials: 'include'
                        });
            
                        const data = await res.json();
            
                        if(!res.ok) throw new Error(data);
            
                        return data as Message;
                    } catch(err) {
                        console.log(err);
                        throw err;
                    }
                }
    }

    return(
        <TicketConversationContext.Provider
            value={{
            ticketConversation: ticketConversation,
            refetchConversation: fetchConversation,
            sendAnswer: fetchSendAnswer
            }}
        >
            {children}
        </TicketConversationContext.Provider>
    )
}

export function useTicketConversation() {
    return useContext(TicketConversationContext);
}