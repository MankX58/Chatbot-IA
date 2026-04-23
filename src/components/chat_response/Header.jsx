import { useState, useEffect, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { APP_SECTIONS } from './chatUtils';

const MENU_ITEMS = [
    { id: APP_SECTIONS.CHAT, label: 'Chat' },
    { id: APP_SECTIONS.TICKETS, label: 'Tickets' },
    { id: APP_SECTIONS.CONFIG, label: 'Configuración' },
];

export default function Header({ activeSection, onNavigate }) {
    const { user, logout } = useAuth0();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNavMenu, setShowNavMenu] = useState(false);
    const [navMenuMounted, setNavMenuMounted] = useState(false);
    const userMenuRef = useRef(null);
    const navMenuRef = useRef(null);

    const handleLogout = () => {
        setShowUserMenu(false);
        logout({ logoutParams: { returnTo: window.location.origin } });
    };

    const toggleUserMenu = () => {
        setShowNavMenu(false);
        setShowUserMenu((current) => !current);
    };

    const handleNavToggle = () => {
        setShowUserMenu(false);
        if (showNavMenu) {
            setShowNavMenu(false);
            return;
        }

        setShowNavMenu(true);
    };

    const stopNavMenuPropagation = (event) => {
        event.stopPropagation();
    };

    const handleNavigate = (section, event) => {
        if (event) event.preventDefault();
        onNavigate?.(section);
        setShowNavMenu(false);
    };

    // Cerrar menú cuando se hace click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }

            if (navMenuRef.current && !navMenuRef.current.contains(event.target)) {
                setShowNavMenu(false);
            }
        };

        if (showUserMenu || showNavMenu) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showNavMenu, showUserMenu]);

    useEffect(() => {
        if (showNavMenu) {
            setNavMenuMounted(true);
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setNavMenuMounted(false);
        }, 220);

        return () => window.clearTimeout(timeoutId);
    }, [showNavMenu]);

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b-[3px] border-b-[#B71C1C] bg-white px-4 py-3 shadow-sm md:px-8">
            <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <button
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-200 bg-white text-[#1a1a2e] shadow-sm transition hover:border-[#B71C1C] hover:text-[#B71C1C] md:hidden"
                    onClick={handleNavToggle}
                    aria-label={showNavMenu ? 'Cerrar menú' : 'Abrir menú'}
                    aria-expanded={showNavMenu}
                >
                    {showNavMenu ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
                            <path d="M6 6l12 12" />
                            <path d="M18 6L6 18" />
                        </svg>
                    ) : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
                            <path d="M4 6h16" />
                            <path d="M4 12h16" />
                            <path d="M4 18h16" />
                        </svg>
                    )}
                </button>

                <button
                    className="cursor-pointer rounded-lg bg-transparent p-0 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B71C1C]"
                    onClick={(event) => handleNavigate(APP_SECTIONS.CHAT, event)}
                >
                    <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9.5 w-9.5 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-[#B71C1C] to-[#D32F2F] text-lg font-extrabold text-white shadow">
                        <span>U</span>
                    </div>
                    <h1 className="max-w-48 truncate text-left text-[0.95rem] font-bold tracking-[-0.02em] text-[#1a1a2e] sm:max-w-none md:text-[1.1rem]">Soporte Tecnológico UdeM</h1>
                    </div>
                </button>
            </div>

            <div
                className={`fixed inset-x-0 top-17 z-40 md:hidden ${navMenuMounted ? 'block' : 'hidden'}`}
                ref={navMenuRef}
                aria-hidden={!showNavMenu}
                onMouseDown={stopNavMenuPropagation}
                onClick={stopNavMenuPropagation}
            >
                <div
                    className={`absolute inset-x-0 top-0 h-[calc(100dvh-4.25rem)] bg-black/25 transition-opacity duration-200 ${showNavMenu ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setShowNavMenu(false)}
                />
                <div className={`relative mx-3 overflow-hidden rounded-b-3xl border border-t-0 border-neutral-200 bg-white shadow-2xl transition-all duration-200 ${showNavMenu ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'}`}>
                    <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">Navegación</p>
                        <span className="rounded-full bg-[#fce4ec] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#B71C1C]">Menú</span>
                    </div>
                    <div className="max-h-[45dvh] overflow-y-auto p-3">
                        <div className="flex flex-col gap-2">
                            {MENU_ITEMS.map((item) => (
                                <button
                                    key={item.id}
                                    className={`flex w-full items-center rounded-2xl px-4 py-4 text-left text-sm font-semibold transition ${
                                        activeSection === item.id
                                            ? 'bg-[#fce4ec] text-[#B71C1C] shadow-sm'
                                            : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100 hover:text-[#1a1a2e]'
                                    }`}
                                    onClick={(event) => handleNavigate(item.id, event)}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative" ref={userMenuRef}>
                {user?.picture ? (
                    <button
                        className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border-0 bg-[#fce4ec] p-0 text-[#B71C1C] transition duration-200 hover:scale-105 hover:shadow"
                        onClick={toggleUserMenu}
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
                        onClick={toggleUserMenu}
                    >
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    </button>
                )}
                
                {showUserMenu && (
                    <div className="absolute right-0 top-full z-60 mt-2 w-[min(18rem,calc(100vw-1rem))] overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg sm:w-70">
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
