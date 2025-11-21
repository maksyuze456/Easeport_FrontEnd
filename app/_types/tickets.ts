export type TicketMessage = {
  ticketMessageId: number;
  ticketId: number;
  sender: string;
  body: string;
  localDateTime: string;
  emailMessageId: string;
  inReplyTo: string | null;
};

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