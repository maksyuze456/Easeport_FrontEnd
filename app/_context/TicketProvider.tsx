'use client';
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';

export type Ticket = {
    id: number;
    subject: string;
    name: string;
    from: string;
    body: string;
    type: string;
    queueType: string;
    language: string;
    priority: string;
    status: string;
    answer: string;
    employeeId: string;
};

export type Answer = {
    message: string
};

export type Message = {
    message: string
};


export type TicketStatus = 'Open' | 'Reviewing' | 'Closed';

const TicketContext = createContext<{
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
}>({
    tickets: null,
    myTickets: null,
    singleTicket: undefined,
    refetch: async () => {},
    refetchSingleTicket: async () => {},
    setAnswer: async (): Promise<Answer> => {
        return { message: '' };
    },
    refetchMyTickets: async () => {},
    assignTicket: async () => {},
    closeTicket: async () => {
        return { message: '' }
    },
    sendAnswer: async () => {
        return { message: ''}
    } 
})

export function TicketProvider({ children }: { children: React.ReactNode }) {
    const [tickets, setTickets] = useState<Ticket[] | null>(null);
    const [currentStatus, setCurrentStatus] = useState<TicketStatus>('Open');
    const [myTickets, setMyTickets] = useState<Ticket[] | null>(null);
    const [singleTicket, setSingleTicket] = useState<Ticket>();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const fetchTickets = async (ticketStatus: TicketStatus) => {
        
        try{
            const res = await fetch(`${apiUrl}/api/tickets/getAllByStatus/${ticketStatus}`, {
                method: 'GET',
                credentials: 'include'
            });
            if(!res.ok) throw new Error("Error while fetching tickets. Errormessage: " + await res.json());
    
            const data = await res.json();
            setTickets(data);
            setCurrentStatus(ticketStatus);
        } catch(err) {
            console.log(err);
        }
    };

    const fetchTicket = async (ticketId : number) => {
        
        try {
            const res = await fetch(`${apiUrl}/api/tickets/${ticketId}`, {
                method: 'GET',
                credentials: 'include'
            });
            const data: Ticket = await res.json();
            if(!res.ok) throw new Error();

            setSingleTicket(data);

        } catch(err) {
            console.log(err);
        }

    };

    const fetchMyTickets = async (ticketStatus: TicketStatus) => {
        
        try{
            const res = await fetch(`${apiUrl}/api/tickets/employeeTickets?status=${ticketStatus}`, {
                method: 'GET',
                credentials: 'include'
            });
            if(!res.ok) throw new Error("Error while fetching tickets. Error message: " + await res.json());
    
            const data = await res.json();
            setMyTickets(data);
            
        } catch(err) {
            console.log(err);
        }
    };

    const fetchAssignTicket = async(ticketId: number) => {

        try {
            const res = await fetch(`${apiUrl}/api/tickets/assign/${ticketId}`, {
                method: 'POST',
                credentials: 'include'
            });

            const data = await res.json();
            fetchTickets(currentStatus);

        } catch(err) {
            console.log(err);
        }

        

    };

    const fetchSetAnswer = async (answer: Answer, ticketId: number): Promise<Answer> => {
        
        try{
            const res = await fetch(`${apiUrl}/api/tickets/setAnswer/${ticketId}`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(answer)
            });
    
            const data = await res.json();
    
            if(!res.ok) throw new Error(data);

            return data as Answer;

        } catch(err) {
            console.log(err);
            throw err;
        }
    };

    const fetchSendAnswer = async (ticketId: number, ticketMessageId?: number): Promise<Message> => {

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

    const fetchCloseTicket = async (ticketId: number) => {

        try {
            const res = await fetch(`${apiUrl}/api/tickets/close/${ticketId}`, {
                method: 'PUT',
                credentials: 'include'
            });

            const resMessage: Message = await res.json();

            return resMessage as Message;


        } catch(err) {
            return err as Message;
        }

    };

    useEffect(() => {
        if(!tickets) fetchTickets(currentStatus);
    }, []);

    return(
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
                sendAnswer: fetchSendAnswer
            }}
        >
            {children}
        </TicketContext.Provider>
    );
}

export function useTickets(){
    return useContext(TicketContext);
}