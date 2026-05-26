import { useCallback, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import TicketsPanel from './TicketsPanel';
import ConfigPanel from './ConfigPanel';
import AgentPanel from './AgentPanel';
import AnalyticsPanel from './AnalyticsPanel';
import Footer from './Footer';
import { sendMessage } from '../../../services/deepseekService';
import { calculateResponseConfidence } from '../../../services/confidenceService';
import { buildSystemPrompt } from '../../../config/systemPrompt';
import {
  APP_SECTIONS,
  createMessage,
  detectBreadcrumb,
  TICKET_STATUS,
} from './chatUtils';
import { useChatHistory } from '../../hooks/useChatHistory';
import { STORAGE_KEYS, readSessionItem, writeSessionItem } from '../../utils/browserStorage';

export default function ChatMain() {
  const { user } = useAuth0();
  const userId = user?.sub;

  const [activeSection, setActiveSection] = useState(APP_SECTIONS.CHAT);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => readSessionItem(STORAGE_KEYS.apiKey, ''));
  const [breadcrumb, setBreadcrumb] = useState('');
  const [chatLocked, setChatLocked] = useState(false);

  const { tickets, saveTicket, clearTickets } = useChatHistory(userId);

  const handleApiKeyChange = useCallback((key) => {
    const trimmedKey = key.trim();
    setApiKey(trimmedKey);
    writeSessionItem(STORAGE_KEYS.apiKey, trimmedKey);
  }, []);

  const handleSend = useCallback(
    async (text) => {
      if (!apiKey) {
        setActiveSection(APP_SECTIONS.CONFIG);
        return;
      }

      const userMessage = createMessage('user', text);
      setMessages((previousMessages) => [...previousMessages, userMessage]);
      setIsLoading(true);

      if (!breadcrumb) {
        setBreadcrumb(detectBreadcrumb(text));
      }

      try {
        const history = [...messages, userMessage].map(({ role, content }) => ({ role, content }));
        const systemPrompt = buildSystemPrompt();
        const reply = await sendMessage(apiKey, history, systemPrompt);
        const confidence = calculateResponseConfidence(text, reply);
        const assistantMessage = createMessage('assistant', reply, {
          showFeedback: true,
          confidence,
          showEscalationHint: confidence.autoEscalate,
        });

        setMessages((previousMessages) => [...previousMessages, assistantMessage]);
      } catch (error) {
        const errorMessage = createMessage(
          'assistant',
          `Error al conectar con DeepSeek: ${error.message}\n\nVerifica tu API key en la seccion de configuracion.`,
          { showFeedback: false }
        );

        setMessages((previousMessages) => [...previousMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, breadcrumb, messages]
  );

  const handleFeedback = useCallback((messageId, isPositive) => {
    setMessages((previousMessages) =>
      previousMessages.map((message) =>
        message.id === messageId
          ? { ...message, showFeedback: false, feedback: isPositive }
          : message
      )
    );
  }, []);

  const saveChatToTickets = useCallback((extraData = {}) => {
    if (chatLocked) return;

    saveTicket(
      messages,
      extraData.rating || null,
      extraData.feedback || '',
      {
        ...extraData,
        breadcrumb,
        ownerId: userId || 'anon',
        ownerName: user?.name || 'Usuario',
        ownerEmail: user?.email || '',
      }
    );
    setChatLocked(true);
  }, [breadcrumb, chatLocked, messages, saveTicket, user?.email, user?.name, userId]);

  const handleChatResolved = useCallback(({ rating, feedback }) => {
    saveChatToTickets({ rating, feedback, status: TICKET_STATUS.RESOLVED });
  }, [saveChatToTickets]);

  const handleChatEscalated = useCallback(({ escalationContext }) => {
    saveChatToTickets({ status: TICKET_STATUS.ESCALATED, escalationContext });
  }, [saveChatToTickets]);

  const handleChatClosed = useCallback(() => {
    saveChatToTickets({ status: TICKET_STATUS.CLOSED });
  }, [saveChatToTickets]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setBreadcrumb('');
    setChatLocked(false);
  }, []);

  const handleClearTickets = useCallback(() => {
    clearTickets();
  }, [clearTickets]);

  const handleSectionChange = useCallback((section) => {
    setActiveSection(section);
  }, []);

  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-[#f8f9fa]">
      <Header activeSection={activeSection} onNavigate={handleSectionChange} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
        {activeSection === APP_SECTIONS.CHAT && (
          <ChatArea
            messages={messages}
            onSend={handleSend}
            isLoading={isLoading}
            onFeedback={handleFeedback}
            onResolved={handleChatResolved}
            onEscalated={handleChatEscalated}
            onClosed={handleChatClosed}
            onNewChat={handleNewChat}
            chatLocked={chatLocked}
            breadcrumb={breadcrumb}
          />
        )}
        {activeSection === APP_SECTIONS.TICKETS && (
          <TicketsPanel tickets={tickets} onClear={handleClearTickets} />
        )}
        {activeSection === APP_SECTIONS.AGENT && <AgentPanel />}
        {activeSection === APP_SECTIONS.ANALYTICS && <AnalyticsPanel />}
        {activeSection === APP_SECTIONS.CONFIG && (
          <ConfigPanel apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
        )}
      </div>
      <Footer />
    </div>
  );
}
