import { useState } from 'react';

export default function ConfigPanel({ apiKey, onApiKeyChange }) {
    const [key, setKey] = useState(apiKey);
    const [saved, setSaved] = useState(false);
    const [showKey, setShowKey] = useState(false);

    const handleSave = () => {
        onApiKeyChange(key.trim());
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    return (
        <main className="flex flex-1 items-start justify-center bg-[#f8f9fa] px-4 py-6 md:px-8 md:py-12">
            <div className="w-full max-w-xl rounded-2xl border border-neutral-100 bg-white px-6 py-8 shadow md:px-10">
                <h2 className="m-0 mb-6 flex items-center gap-2 text-[1.2rem] font-bold text-[#1a1a2e]">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Configuración
                </h2>

                <div className="mb-6">
                    <label className="mb-1 block text-sm font-semibold text-neutral-800" htmlFor="apiKeyInput">
                        API Key de DeepSeek
                    </label>
                    <p className="mb-3 text-xs leading-relaxed text-neutral-500">
                        Ingresa tu API key de DeepSeek para habilitar el chatbot. Puedes obtener una en{' '}
                        <a className="font-medium text-[#B71C1C] hover:underline" href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer">
                            platform.deepseek.com
                        </a>.
                    </p>
                    <div className="mb-4 flex items-center gap-2">
                        <input
                            id="apiKeyInput"
                            type={showKey ? 'text' : 'password'}
                            className="flex-1 rounded-[10px] border border-neutral-300 px-4 py-3 font-mono text-sm text-neutral-700 outline-none transition focus:border-[#B71C1C] focus:ring-2 focus:ring-[#B71C1C]/20"
                            placeholder="sk-..."
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                        />
                        <button
                            type="button"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-neutral-300 bg-white text-neutral-500 transition hover:border-[#B71C1C] hover:text-[#B71C1C]"
                            onClick={() => setShowKey(!showKey)}
                            aria-label={showKey ? 'Ocultar' : 'Mostrar'}
                        >
                            {showKey ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>
                    <button
                        className={`flex w-full items-center justify-center gap-2 rounded-[10px] border-0 px-3 py-3 text-sm font-semibold text-white transition ${
                            saved
                            ? 'bg-linear-to-br from-green-700 to-green-500'
                            : 'bg-linear-to-br from-[#B71C1C] to-[#D32F2F] hover:-translate-y-0.5 hover:shadow'
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                        onClick={handleSave}
                        disabled={!key.trim()}
                    >
                        {saved ? (
                            <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Guardado
                            </>
                        ) : (
                            'Guardar API Key'
                        )}
                    </button>
                </div>

                <div className="flex gap-2 rounded-[10px] border border-neutral-100 bg-neutral-50 px-4 py-3">
                    <div className="mt-px shrink-0 text-[#B71C1C]">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                        </svg>
                    </div>
                    <p className="m-0 text-xs leading-relaxed text-neutral-500">Tu API key se almacena únicamente en tu navegador y nunca se envía a nuestros servidores.</p>
                </div>
            </div>
        </main>
    );
}
