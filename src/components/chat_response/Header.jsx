import { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { APP_SECTIONS } from './chatUtils';

export default function Header({ onNavigate }) {
    const { user, logout } = useAuth0();
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = () => {
        setShowMenu(false);
        logout({ logoutParams: { returnTo: window.location.origin } });
    };

    const toggleMenu = () => {
        setShowMenu(!showMenu);
    };

    const handleNavigate = (section, event) => {
        if (event) event.preventDefault();
        onNavigate?.(section);
    };

    // Cerrar menú cuando se hace click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showMenu]);

    return (
        <header className="sticky top-0 z-50 flex h-15 items-center justify-between border-b-[3px] border-b-[#B71C1C] bg-white px-4 shadow-sm md:px-8">
            <button
                className="cursor-pointer rounded-lg bg-transparent p-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B71C1C]"
                onClick={(event) => handleNavigate(APP_SECTIONS.CHAT, event)}
            >
                <div className="flex items-center gap-3">
                <div className="flex h-9.5 w-9.5 items-center justify-center rounded-lg bg-linear-to-br from-[#B71C1C] to-[#D32F2F] text-lg font-extrabold text-white shadow">
                    <span>U</span>
                </div>
                <h1 className="text-left text-[0.95rem] font-bold tracking-[-0.02em] text-[#1a1a2e] md:text-[1.1rem]">Soporte Tecnológico UdeM</h1>
                </div>
            </button>

            <nav className="hidden items-center gap-8 md:flex">
                <a href="#" className="text-sm font-medium text-neutral-600 transition-colors hover:text-[#B71C1C]" onClick={(event) => handleNavigate(APP_SECTIONS.CHAT, event)}>Inicio</a>
                <a href="#" className="text-sm font-medium text-neutral-600 transition-colors hover:text-[#B71C1C]">Servicios</a>
                <a href="#" className="text-sm font-medium text-neutral-600 transition-colors hover:text-[#B71C1C]">FAQ</a>
            </nav>

            <div className="relative" ref={menuRef}>
                {user?.picture ? (
                    <button
                        className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 bg-[#fce4ec] p-0 text-[#B71C1C] transition duration-200 hover:scale-105 hover:shadow"
                        onClick={toggleMenu}
                        title="Menú de usuario"
                    >
                        <img 
                            src={user.picture} 
                            alt={user.name || 'Usuario'}
                            className="h-full w-full rounded-full object-cover"
                        />
                    </button>
                ) : (
                    <button
                        className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 bg-[#fce4ec] p-0 text-[#B71C1C] transition duration-200 hover:scale-105 hover:shadow"
                        onClick={toggleMenu}
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </button>
                )}
                
                {showMenu && (
                    <div className="absolute right-0 top-full z-60 mt-2 min-w-70 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
                        {user && (
                            <>
                                <div className="flex items-center gap-4 bg-neutral-100 p-4">
                                    {user.picture && (
                                        <img 
                                            src={user.picture} 
                                            alt={user.name}
                                            className="h-12 w-12 rounded-full object-cover"
                                        />
                                    )}
                                    <div>
                                        <p className="m-0 text-[0.95rem] font-bold text-[#1a1a2e]">{user.name || 'Usuario'}</p>
                                        <p className="m-0 mt-1 break-all text-xs text-neutral-500">{user.email}</p>
                                    </div>
                                </div>
                                <div className="h-px bg-neutral-200"></div>
                            </>
                        )}
                        <button
                            className="w-full cursor-pointer border-0 bg-transparent px-4 py-3 text-left text-sm font-semibold text-[#B71C1C] transition-colors hover:bg-[#fce4ec]"
                            onClick={handleLogout}
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
