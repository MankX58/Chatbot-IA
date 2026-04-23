// App.jsx

import { useCallback, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import TicketsPanel from './TicketsPanel';
import ConfigPanel from './ConfigPanel';
import Footer from './Footer';
import { sendMessage } from '../../../services/deepseekService';
import { buildSystemPrompt } from '../../../config/systemPrompt';
import { APP_SECTIONS, createMessage, detectBreadcrumb, TICKET_STATUS } from './chatUtils';
import { useChatHistory } from '../../hooks/useChatHistory';

// ─── ChatMain ─────────────────────────────────────────────────────────────────
export default function ChatMain() {
  const { user } = useAuth0();
  const userId = user?.sub;
  
  const [activeSection, setActiveSection] = useState(APP_SECTIONS.CHAT);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('deepseek_api_key') || '');
  const [breadcrumb, setBreadcrumb] = useState('');
  const [chatLocked, setChatLocked] = useState(false);
  
  const { tickets, saveTicket, clearTickets } = useChatHistory(userId);

  const handleApiKeyChange = useCallback((key) => {
    setApiKey(key);
    localStorage.setItem('deepseek_api_key', key);
  }, []);

  const handleSend = useCallback(
    async (text) => {
      if (!apiKey) {
        setActiveSection(APP_SECTIONS.CONFIG);
        return;
      }

      const userMsg = createMessage('user', text);
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);

      if (!breadcrumb) {
        setBreadcrumb(detectBreadcrumb(text));
      }

      try {
        const systemPrompt = buildSystemPrompt();
        const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }));
        const reply = await sendMessage(apiKey, history, systemPrompt);
        const botMsg = createMessage('assistant', reply, { showFeedback: true });
        setMessages((prev) => [...prev, botMsg]);
      } catch (err) {
        const errorMsg = createMessage(
          'assistant',
          `⚠️ Error al conectar con DeepSeek: ${err.message}\n\nVerifica tu API key en la sección de Configuración.`,
          { showFeedback: false }
        );
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [apiKey, messages, breadcrumb]
  );

  const handleFeedback = useCallback((msgId, isPositive) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId ? { ...msg, showFeedback: false, feedback: isPositive } : msg
      )
    );
  }, []);

  const saveChatToTickets = useCallback((extraData = {}) => {
    if (chatLocked) return;
    
    saveTicket(
      messages,
      extraData.rating || null,
      extraData.feedback || '',
      { ...extraData, breadcrumb }
    );
    setChatLocked(true);
  }, [messages, breadcrumb, saveTicket, chatLocked]);

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
        {activeSection === APP_SECTIONS.CONFIG && (
          <ConfigPanel apiKey={apiKey} onApiKeyChange={handleApiKeyChange} />
        )}
        {activeSection === APP_SECTIONS.TICKETS && (
          <TicketsPanel tickets={tickets} onClear={handleClearTickets} />
        )}
      </div>
      <Footer />
    </div>
  );
}