import { APP_SECTIONS } from './chatUtils';

const MENU_ITEMS = [
  { id: APP_SECTIONS.CHAT, label: 'Chat de soporte', icon: 'chat' },
  { id: APP_SECTIONS.TICKETS, label: 'Mis tickets', icon: 'ticket' },
  { id: APP_SECTIONS.AGENT, label: 'Panel de soporte', icon: 'support' },
  { id: APP_SECTIONS.ANALYTICS, label: 'Dashboard', icon: 'analytics' },
];

const icons = {
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  ticket: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 10h20" />
    </svg>
  ),
  support: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  analytics: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  ),
  config: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

export default function Sidebar({ activeSection, onSectionChange, availableSections, roleLabel, isCollapsed, onToggleCollapse }) {
  const menuItems = MENU_ITEMS.filter((item) => availableSections.includes(item.id));

  return (
    <aside className={`hidden flex-col border-r border-r-neutral-200 bg-white py-6 md:flex transition-all duration-300 ${isCollapsed ? 'w-20 min-w-20' : 'w-72 min-w-72'}`}>
      <div className={`border-b border-b-neutral-100 pb-6 flex flex-col items-center ${isCollapsed ? 'px-2' : 'px-5'}`}>
        <div className={`mb-4 flex items-center justify-between w-full ${isCollapsed ? 'flex-col gap-3' : 'gap-3'}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fce4ec] text-[#B71C1C]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
                <path d="M5.5 18.5c1.5-2.5 3.8-4 6.5-4s5 1.5 6.5 4" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h3 className="m-0 text-[0.95rem] font-bold text-[#1a1a2e]">UdeM Virtual</h3>
                <p className="m-0 mt-0.5 text-[0.78rem] text-neutral-500">Asistente y mesa de ayuda</p>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 hover:border-[#B71C1C] hover:text-[#B71C1C] transition-colors ${isCollapsed ? 'mt-1' : ''}`}
            title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          >
            {isCollapsed ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            )}
          </button>
        </div>
        {!isCollapsed && (
          <div className="rounded-2xl bg-neutral-50 p-4 w-full">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400">Cobertura actual</p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              {roleLabel === 'Administrador' && 'Chat, tickets, soporte y metricas habilitados para gestion integral del MVP.'}
              {roleLabel === 'Agente de soporte' && 'Chat, tickets y panel operativo habilitados para gestionar casos escalados.'}
              {roleLabel === 'Usuario' && 'Chat y seguimiento de tickets disponibles para el usuario final.'}
            </p>
          </div>
        )}
      </div>

      <nav className={`flex flex-1 flex-col gap-1 py-4 ${isCollapsed ? 'px-2 items-center' : 'px-3'}`}>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`flex items-center rounded-[10px] border-0 py-3 text-[0.88rem] font-medium transition-all duration-200 ${
              isCollapsed
                ? 'w-12 h-12 justify-center px-0'
                : 'w-full px-4 text-left gap-2.5'
            } ${
              activeSection === item.id
                ? 'bg-[#B71C1C] text-white shadow'
                : 'bg-transparent text-neutral-600 hover:bg-[#fce4ec] hover:text-[#B71C1C]'
            }`}
            onClick={() => onSectionChange(item.id)}
            title={isCollapsed ? item.label : undefined}
          >
            <span className="flex items-center">{icons[item.icon]}</span>
            {!isCollapsed && item.label}
          </button>
        ))}
      </nav>

      <div className={`border-t border-t-neutral-100 pt-4 flex ${isCollapsed ? 'justify-center px-2' : 'px-5'}`}>
        <div className="flex items-center gap-2 text-[0.78rem] text-neutral-500" title={isCollapsed ? 'Entorno activo' : undefined}>
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500 shadow" />
          {!isCollapsed && 'Entorno activo'}
        </div>
      </div>
    </aside>
  );
}
