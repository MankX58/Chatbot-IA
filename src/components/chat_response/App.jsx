import { useCallback, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import TicketsPanel from './TicketsPanel';
import AgentPanel from './AgentPanel';
import AnalyticsPanel from './AnalyticsPanel';
import Footer from './Footer';
import { sendMessage } from '../../../services/deepseekService';
import { calculateResponseConfidence } from '../../../services/confidenceService';
import {
  APP_SECTIONS,
  createMessage,
  detectBreadcrumb,
  TICKET_STATUS,
} from './chatUtils';
import { useChatHistory } from '../../hooks/useChatHistory';
import {
  getAvailableSections,
  getPrimaryRoleLabel,
  getUserRoles,
  isSectionAvailable,
} from '../../utils/accessControl';

export default function ChatMain() {
  const { user } = useAuth0();
  const userId = user?.sub;
  const userRoles = getUserRoles(user);
  const availableSections = getAvailableSections(userRoles);
  const roleLabel = getPrimaryRoleLabel(userRoles);

  const [activeSection, setActiveSection] = useState(() => {
    return availableSections.length > 0 ? availableSections[0] : APP_SECTIONS.CHAT;
  });
  const [messages, setMessages] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebar_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', JSON.stringify(next));
      } catch (err) {
        console.error(err);
      }
      return next;
    });
  }, []);
  const [isLoading, setIsLoading] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState('');
  const [chatLocked, setChatLocked] = useState(false);

  const { tickets, saveTicket, updateSingleTicket, clearTickets } = useChatHistory(userId);

  useEffect(() => {
    if (!isSectionAvailable(activeSection, userRoles)) {
      if (availableSections.length > 0) {
        setActiveSection(availableSections[0]);
      }
    }
  }, [activeSection, userRoles, availableSections]);

  const handleSend = useCallback(
    async (text) => {
      const userMessage = createMessage('user', text);
      // Clear feedback from all previous messages so options only show on last AI response
      setMessages((previousMessages) => [
        ...previousMessages.map((m) => ({ ...m, showFeedback: false })),
        userMessage,
      ]);
      setIsLoading(true);

      if (!breadcrumb) {
        setBreadcrumb(detectBreadcrumb(text));
      }

      try {
        const history = [...messages, userMessage].map(({ role, content }) => ({ role, content }));
        const reply = await sendMessage(history);
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
          `Error al conectar con el servicio de IA: ${error.message}\n\nRevisa la configuracion del backend en la seccion de configuracion.`,
          { showFeedback: false }
        );

        setMessages((previousMessages) => [...previousMessages, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [breadcrumb, messages]
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
        ownerName: user?.name || user?.nickname || user?.email?.split('@')[0] || 'Usuario',
        ownerEmail: user?.email || '',
      }
    );
    setChatLocked(true);
  }, [breadcrumb, chatLocked, messages, saveTicket, user?.email, user?.name, user?.nickname, userId]);

  const handleChatResolved = useCallback(({ rating, feedback }) => {
    saveChatToTickets({ rating, feedback, status: TICKET_STATUS.RESOLVED });
  }, [saveChatToTickets]);

  const handleChatEscalated = useCallback(({ escalationContext, priority }) => {
    saveChatToTickets({ status: TICKET_STATUS.ESCALATED, escalationContext, priority: priority || 'Media' });
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

  const handleSendStudentMessage = useCallback((ticketId, content) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const updatedTicket = {
      ...ticket,
      messageCount: ticket.messageCount + 1,
      updatedAt: new Date().toISOString(),
      messages: [
        ...(ticket.messages || []),
        {
          role: 'user',
          content,
          timestamp: new Date().toISOString(),
        },
      ],
    };

    updateSingleTicket(updatedTicket);
  }, [tickets, updateSingleTicket]);

  const handleSectionChange = useCallback((section) => {
    if (!isSectionAvailable(section, userRoles)) {
      return;
    }

    setActiveSection(section);
  }, [userRoles]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f8f9fa]">
      <Header
        activeSection={activeSection}
        onNavigate={handleSectionChange}
        availableSections={availableSections}
        roleLabel={roleLabel}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          availableSections={availableSections}
          roleLabel={roleLabel}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
        {activeSection === APP_SECTIONS.CHAT && isSectionAvailable(APP_SECTIONS.CHAT, userRoles) && (
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
        {activeSection === APP_SECTIONS.TICKETS && isSectionAvailable(APP_SECTIONS.TICKETS, userRoles) && (
          <TicketsPanel
            tickets={tickets}
            onClear={handleClearTickets}
            onSendStudentMessage={handleSendStudentMessage}
          />
        )}
        {activeSection === APP_SECTIONS.AGENT && isSectionAvailable(APP_SECTIONS.AGENT, userRoles) && (
          <AgentPanel />
        )}
        {activeSection === APP_SECTIONS.ANALYTICS && isSectionAvailable(APP_SECTIONS.ANALYTICS, userRoles) && (
          <AnalyticsPanel />
        )}
      </div>
      <Footer />
    </div>
  );
}
