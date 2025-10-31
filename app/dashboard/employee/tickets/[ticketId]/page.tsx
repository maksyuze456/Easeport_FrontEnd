'use client';
import React from 'react';
import { Center, Notification, Text, Button, Box, LoadingOverlay } from "@mantine/core";
import { useAuthContext } from "../../../../_context/AuthProvider";
import { Answer, Message, useTickets } from "../../../../_context/TicketProvider";
import ViewTicket from "./ViewTicket";
import { IconX, IconCheck } from '@tabler/icons-react';
import { createPortal } from "react-dom";
import { useParams, useRouter } from "next/navigation";
import { use, useEffect, useState } from 'react';
import ConversationTable from './ViewConversation';
import { useTicketConversation } from '@/app/_context/TicketConversationProvider';
export default function ViewTicketPage() {
    const params = useParams();
    const ticketId = Number(params.ticketId);
    const router = useRouter();

    const { loggedInUser } = useAuthContext();

    const { singleTicket, refetchSingleTicket } = useTickets();
    const { refetchConversation } = useTicketConversation();
    const [loading, setLoading] = useState(false);

    const [responseMessage, setResponseMessage] = useState<Answer | null>(null);
    const [showNotification, setShowNotification] = useState(false);
    const condition = singleTicket?.id !== ticketId;

    const handleSuccess = (res: Answer) => {
        setResponseMessage(res);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
    };

    const handleCloseTicket = (res: Message) => {
        setResponseMessage(res);
        setShowNotification(true)
        setTimeout(() => setShowNotification(false), 3000);
    };

    useEffect(() => {
        if (condition) {
            setLoading(true);
            refetchSingleTicket(ticketId);
            setTimeout(() => setLoading(false), 500);
        }
    }, [ticketId]);

    
    

    return (
        <>
        <div style={{ padding: "16px" }}>
            <Button
                variant="default"
                onClick={() => router.push(`/dashboard/employee/my_tickets?status=${singleTicket?.status}`)}
            >
                Back
            </Button>
        </div>
            <div style={{
                marginTop: "10px",
                padding: "16px",
                display: "flex",
                alignItems: "center"
            }}>
                <div style={{ flex: "1" }}>
                    <Center>
                        <Box pos="relative" style={{
                            maxWidth: "600px",
                            width: "100%",
                            padding: "10px",
                            border: "2px solid white",
                            borderRadius: "10px",
                            boxShadow: "0px 1px 5px 5px #eef0f3ff"
                        }}>
                            <LoadingOverlay
                                visible={loading}
                                zIndex={1000}
                                overlayProps={{ radius: "sm", blur: 2 }}
                            />

                            <Text fw={500} size="lg" ml="xs">
                                Ticket
                            </Text>

                            {singleTicket && (
                                <ViewTicket
                                    ticket={singleTicket}
                                    userId={loggedInUser?.id}
                                    onSuccess={handleSuccess}
                                    onCloseTicket={handleCloseTicket}
                                />
                            )}
                        </Box>
                    </Center>
                </div>
                <div style={{ flex: "1" }}>
                    <ConversationTable
                        onSuccess={handleSuccess}
                        onCloseTicket={handleCloseTicket}
                    />
                </div>
                {showNotification && createPortal(
                    <div style={{
                        position: 'fixed',
                        bottom: 20,
                        right: 20,
                        zIndex: 1000
                    }}>
                        <Notification
                            icon={<IconCheck size={20} />}
                            color="teal"
                            title="All good!"
                            onClose={() => setShowNotification(false)}
                        >
                            {responseMessage?.message || "Response saved successfully"}
                        </Notification>
                    </div>,
                    document.body
                )}
            </div>
        </>
    );
    


}