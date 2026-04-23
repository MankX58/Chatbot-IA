import './Header.css';

export default function Header() {
    return (
        <header className="header">
            <div className="header__left">
                <div className="header__logo">
                    <span className="header__logo-icon">U</span>
                </div>
                <h1 className="header__title">Soporte Tecnológico UdeM</h1>
            </div>
            <nav className="header__nav">
                <a href="#" className="header__link">Inicio</a>
                <a href="#" className="header__link">Servicios</a>
                <a href="#" className="header__link">Preguntas Frecuentes</a>
            </nav>
            <div className="header__avatar">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            </div>
        </header>
    );
}
