import { MensajeChat } from '../types/chat';

export const groupMessagesBySender = (messages: MensajeChat[]) => {
  return messages.reduce((acc, msg) => {
    acc[msg.remitente] = (acc[msg.remitente] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
};

export const formatChatHour = (isoString: string): string => {
  const d = new Date(isoString);
  return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
};
