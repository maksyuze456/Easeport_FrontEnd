import { Box, Paper, Text, ScrollArea, Button, Textarea, Flex } from '@mantine/core';
import { useParams } from 'next/navigation';
import { useForm } from "@mantine/form";
import { Answer, Message, useTickets } from "../../../../_context/TicketProvider";
import { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '@/app/_context/AuthProvider';
import { IconX } from '@tabler/icons-react';
import { TicketMessage, useTicketConversation } from '@/app/_context/TicketConversationProvider';

export default function ConversationTable({
    onSuccess, onCloseTicket
}: {
    onSuccess?: (res: Answer) => void;
    onCloseTicket?: (res: Message) => void;

}) {
    const params = useParams();
    const ticketId = Number(params.ticketId);
    const { loggedInUser } = useAuthContext();
    const { setAnswer, refetchSingleTicket, singleTicket, closeTicket } = useTickets();
    const [loadingConversation, setLoadingConversation] = useState(false);
    const [replyTo, setReplyTo] = useState<TicketMessage | null>(null);
    const [showReplyHighlight, setShowReplyHighlight] = useState(false);
    const { ticketConversation, refetchConversation, sendAnswer } = useTicketConversation();
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const prevTicketId = useRef<number | null>(null);
    const isClosed = singleTicket?.status?.toLowerCase() === 'closed';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    const currentUser = loggedInUser?.username; // This should come from your auth context loggedInUser?.username;
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
            const resAnswerMessage = await setAnswer(answer, ticketId);
            refetchSingleTicket(ticketId);
            
            let resSendMessage;

            if(replyTo != null) {
                resSendMessage = await sendAnswer(ticketId, replyTo.ticketMessageId);
            } else {
                resSendMessage = await sendAnswer(ticketId);
            }

            if(onSuccess) {
                onSuccess(resSendMessage);
                form.reset();
                refetchConversation(ticketId, loadingConversation, setLoadingConversation);
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

    const handleReply = (message: TicketMessage) => {
        setReplyTo(message);
        setTimeout(() => setShowReplyHighlight(true), 10);
        setTimeout(() => textareaRef.current?.focus(), 60);
    };

    const cancelReply = () => {
        setShowReplyHighlight(false);
        setTimeout(() => setReplyTo(null), 180);
    };

    useEffect(() => {
        if (ticketId && !Number.isNaN(ticketId)) {
            refetchConversation(ticketId, loadingConversation, setLoadingConversation);
        }
    }, [ticketId]);


    return (
        <Box style={{ height: '700px', padding: '16px' }}>
            <Paper shadow="xs" p="md">
                <Text fw={500} size="lg" mb="md">Conversation History</Text>
                <ScrollArea h={500} offsetScrollbars>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {ticketConversation.map((message: TicketMessage) => {
                            const isCurrentUser = message.sender === currentUser;
                            // find the message this one replies to (if any)
                            const repliedTo = ticketConversation.find((m: TicketMessage) => m.emailMessageId === message.inReplyTo);
                            return (
                                <div
                                    key={message.ticketMessageId}
                                    style={{
                                        display: 'flex',
                                        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start',
                                        width: '100%'
                                    }}
                                >
                                    <div style={{ maxWidth: '70%' }}>
                                        {repliedTo && (
                                            <div
                                                style={{
                                                    marginBottom: 6,
                                                    padding: '6px 8px',
                                                    borderLeft: '3px solid rgba(34,139,230,0.9)',
                                                    background: '#fbfdff',
                                                    borderRadius: 8,
                                                    color: 'rgba(0,0,0,0.75)',
                                                    fontSize: 13,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                <Text size="xs" c="dimmed">In reply to {repliedTo.sender}:</Text>
                                                <Text size="sm" style={{ maxWidth: 420, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{repliedTo.body}</Text>
                                            </div>
                                        )}

                                        <Paper
                                            shadow="sm"
                                            p="sm"
                                            style={{
                                                backgroundColor: isCurrentUser ? '#E3F2FD' : '#F5F5F5',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Text size="sm" c="dimmed" mb={4}>
                                                    {message.sender}
                                                </Text>
                                                <a
                                                    href="#"
                                                    onClick={(e) => { e.preventDefault(); handleReply(message); }}
                                                    style={{ textDecoration: 'none', cursor: 'pointer' }}
                                                >
                                                    <Text size="sm" c="dimmed" mb={4}>
                                                        reply
                                                    </Text>
                                                </a>
                                            </div>
                                            <Text>{message.body}</Text>
                                            <Text size="xs" c="dimmed" mt={4}>
                                                {new Date(message.localDateTime).toLocaleTimeString()}
                                            </Text>
                                        </Paper>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>

                <Paper shadow="xs" p="md" mt="md">
                    {replyTo && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '8px',
                                borderLeft: '4px solid #228be6',
                                marginBottom: '8px',
                                background: '#f7fbff',
                                borderRadius: 6,
                                transition: 'transform 180ms ease, opacity 180ms ease',
                                transform: showReplyHighlight ? 'translateY(0)' : 'translateY(-6px)',
                                opacity: showReplyHighlight ? 1 : 0
                            }}
                        >
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                <Text size="xs" c="dimmed">Replying to {replyTo.sender}</Text>
                                <Text size="sm" style={{ maxWidth: 420, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{replyTo.body}</Text>
                            </div>
                            <button type="button" onClick={cancelReply} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} aria-label="Cancel reply">
                                <IconX size={16} />
                            </button>
                        </div>
                    )}
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
                            ref={textareaRef}
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