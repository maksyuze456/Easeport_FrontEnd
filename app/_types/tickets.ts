

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

export type TicketStatus = "Open" | "Reviewing" | "Closed";