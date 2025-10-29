import { Box, Paper, Text, ScrollArea, Button, Textarea, Flex } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useForm } from "@mantine/form";
import { Answer, Message, useTickets } from "../../../../_context/TicketProvider";
import { useEffect, useRef } from 'react';

interface TicketMessage {
    ticketMessageId: number;
    ticketId: number;
    sender: string;
    body: string;
    localDateTime: string;
    emailMessageId: string;
    inReplyTo: string | null;
}

export default function ConversationTable({
    onSuccess, onCloseTicket
}: {
    onSuccess?: (res: Answer) => void;
    onCloseTicket?: (res: Message) => void;

}) {
    const params = useParams();
    const ticketId = Number(params.ticketId);
    const currentUser = "support@easeport.com"; // This should come from your auth context
    const { setAnswer, refetchSingleTicket, singleTicket, closeTicket } = useTickets();
    const prevTicketId = useRef<number | null>(null);
    const isClosed = singleTicket?.status?.toLowerCase() === 'closed';

    const form = useForm({
        mode: 'controlled',
        initialValues: {
            message: singleTicket?.answer || ""
        }
    });

    useEffect(() => {
        if (prevTicketId.current !== singleTicket?.id && singleTicket?.id !== undefined) {
            form.setValues({ message: singleTicket?.answer || "" });
            prevTicketId.current = singleTicket.id;
        }
    }, [singleTicket?.id]);

    const handleSubmit = async (values: typeof form.values, e?: React.FormEvent) => {
        e?.preventDefault();
        if (isClosed) return;
        try {
            const answer: Answer = form.getValues();
            const resMessage = await setAnswer(answer, ticketId);
            refetchSingleTicket(ticketId);

            if(onSuccess) {
                onSuccess(resMessage);
            }

        } catch (err) {
            console.log(err);
        }
    };

    const handleCloseTicket = async () => {
        try {
            const res = await closeTicket(ticketId);
            refetchSingleTicket(ticketId);

            if(onCloseTicket) {
            onCloseTicket(res);
            }

        } catch (err) {
            console.log(err as Message);
        }
    };

    // Test data
    const messages: TicketMessage[] = [
        {
            ticketMessageId: 1,
            ticketId: ticketId,
            sender: "customer@example.com",
            body: "Hi, I'm having issues with my account login. Can you help?",
            localDateTime: "2025-10-29T10:00:00",
            emailMessageId: "msg_001",
            inReplyTo: null
        },
        {
            ticketMessageId: 2,
            ticketId: ticketId,
            sender: "support@easeport.com",
            body: "Hello! I'd be happy to help you with your login issues. Could you please provide more details about what's happening when you try to log in?",
            localDateTime: "2025-10-29T10:05:00",
            emailMessageId: "msg_002",
            inReplyTo: "msg_001"
        },
        {
            ticketMessageId: 3,
            ticketId: ticketId,
            sender: "customer@example.com",
            body: "When I enter my credentials, it just shows a spinning wheel and nothing happens.",
            localDateTime: "2025-10-29T10:10:00",
            emailMessageId: "msg_003",
            inReplyTo: "msg_002"
        },
        {
            ticketMessageId: 4,
            ticketId: ticketId,
            sender: "support@easeport.com",
            body: "Thank you for the details. I'll check this issue right away. Could you please try clearing your browser cache and cookies, then attempt to log in again?",
            localDateTime: "2025-10-29T10:15:00",
            emailMessageId: "msg_004",
            inReplyTo: "msg_003"
        }
    ];

    return (
        <Box style={{ height: '700px', padding: '16px' }}>
            <Paper shadow="xs" p="md">
                <Text fw={500} size="lg" mb="md">Conversation History</Text>
                <ScrollArea h={500} offsetScrollbars>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {messages.map((message) => {
                            const isCurrentUser = message.sender === currentUser;
                            return (
                                <div
                                    key={message.ticketMessageId}
                                    style={{
                                        display: 'flex',
                                        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                                        width: '100%'
                                    }}
                                >
                                    <Paper
                                        shadow="sm"
                                        p="sm"
                                        style={{
                                            maxWidth: '70%',
                                            backgroundColor: isCurrentUser ? '#E3F2FD' : '#F5F5F5',
                                            borderRadius: '12px',
                                            marginLeft: isCurrentUser ? 'auto' : '0',
                                            marginRight: isCurrentUser ? '0' : 'auto'
                                        }}
                                    >
                                        <Text size="sm" c="dimmed" mb={4}>
                                            {message.sender}
                                        </Text>
                                        <Text>{message.body}</Text>
                                        <Text size="xs" c="dimmed" mt={4}>
                                            {new Date(message.localDateTime).toLocaleTimeString()}
                                        </Text>
                                    </Paper>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                <Paper shadow="xs" p="md" mt="md">
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Textarea
                            styles={{
                                input: {
                                    width: "100%",
                                    height: "100px",
                                    resize: "vertical"
                                },
                                wrapper: {
                                    width: "100%"
                                }
                            }}
                            required
                            placeholder="Type your response..."
                            {...form.getInputProps('message')}
                            disabled={isClosed}
                        />
                        <Flex justify="flex-end" gap="md" mt="md">
                            <Button
                                variant="default"
                                size="sm"
                                radius="md"
                                onClick={handleCloseTicket}
                                disabled={isClosed}
                            >
                                Close Ticket
                            </Button>
                            <Button
                                type="submit"
                                size="sm"
                                radius="md"
                                disabled={isClosed}
                            >
                                Send Response
                            </Button>
                        </Flex>
                    </form>
                </Paper>
            </Paper>
        </Box>
    );
}