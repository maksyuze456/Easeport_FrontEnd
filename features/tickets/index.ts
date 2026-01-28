// Types
export * from "./types";

// API
export * from "./api/tickets";

// Hooks
export * from "./hooks/useTicketQueries";

// Legacy Components (kept for backwards compatibility)
export { default as TicketsTable, priorityColors, ticketStatusColors } from "./components/TicketsTable/TicketsTable";
export { default as ViewTicket } from "./components/ViewTicket/ViewTicket";
export { default as ViewConversation } from "./components/ViewConversation/ViewConversation";

// New Modular Components
export * from "./components/shared";
export * from "./components/TicketDetail";
export * from "./components/ConversationPanel";
