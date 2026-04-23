import './Sidebar.css';

const MENU_ITEMS = [
    { id: 'chat', label: 'Chat de Soporte', icon: 'chat' },
    { id: 'tickets', label: 'Mis Tickets', icon: 'ticket' },
    { id: 'config', label: 'Configuración', icon: 'config' },
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
    config: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
    ),
};

export default function Sidebar({ activeSection, onSectionChange }) {
    return (
        <aside className="sidebar">
            <div className="sidebar__profile">
                <div className="sidebar__avatar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                        <path d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z" />
                        <path d="M5.5 18.5c1.5-2.5 3.8-4 6.5-4s5 1.5 6.5 4" />
                    </svg>
                </div>
                <div className="sidebar__info">
                    <h3 className="sidebar__name">UdeM Virtual</h3>
                    <p className="sidebar__role">Asistente Inteligente</p>
                </div>
            </div>

            <nav className="sidebar__menu">
                {MENU_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        className={`sidebar__item ${activeSection === item.id ? 'sidebar__item--active' : ''}`}
                        onClick={() => onSectionChange(item.id)}
                    >
                        <span className="sidebar__item-icon">{icons[item.icon]}</span>
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="sidebar__footer">
                <div className="sidebar__status">
                    <span className="sidebar__status-dot" />
                    En línea
                </div>
            </div>
        </aside>
    );
}
