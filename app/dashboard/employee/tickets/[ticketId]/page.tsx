'use client';
import { Center, Notification, Text, Button, Box, LoadingOverlay } from "@mantine/core";
import { useAuthContext } from "../../../../_context/AuthProvider";
import { Answer, Message, useTickets } from "../../../../_context/TicketProvider";
import ViewTicket from "./ViewTicket";
import { IconX, IconCheck } from '@tabler/icons-react';
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useEffect, useState } from 'react';

export default function ViewTicketPage({ params }: { params: { ticketId: number } }) {
    const ticketId = params.ticketId;
    const { loggedInUser } = useAuthContext();
    const { singleTicket, refetchSingleTicket } = useTickets();
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [responseMessage, setResponseMessage] = useState<Answer | null>(null);
    const [showNotification, setShowNotification] = useState(false);

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
        if (singleTicket?.id !== ticketId) {
            setLoading(true);
            refetchSingleTicket(ticketId);
            setTimeout(() => setLoading(false), 500);
        }
    }, [ticketId]);

    
    

    return(
        <>
        <div style={{ padding: "16px" }}>
            <Button
                variant="default"
                onClick={() => router.push(`/dashboard/employee/my_tickets?status=${singleTicket?.status}`)}
            >
                Back
            </Button>
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