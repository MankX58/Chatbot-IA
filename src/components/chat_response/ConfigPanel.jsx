import { useState } from 'react';
import './ConfigPanel.css';

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
        <main className="config">
            <div className="config__card">
                <h2 className="config__title">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Configuración
                </h2>

                <div className="config__section">
                    <label className="config__label" htmlFor="apiKeyInput">
                        API Key de DeepSeek
                    </label>
                    <p className="config__description">
                        Ingresa tu API key de DeepSeek para habilitar el chatbot. Puedes obtener una en{' '}
                        <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer">
                            platform.deepseek.com
                        </a>.
                    </p>
                    <div className="config__input-group">
                        <input
                            id="apiKeyInput"
                            type={showKey ? 'text' : 'password'}
                            className="config__input"
                            placeholder="sk-..."
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                        />
                        <button
                            type="button"
                            className="config__toggle-btn"
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
                        className={`config__save-btn ${saved ? 'config__save-btn--saved' : ''}`}
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

                <div className="config__info">
                    <div className="config__info-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                        </svg>
                    </div>
                    <p>Tu API key se almacena únicamente en tu navegador y nunca se envía a nuestros servidores.</p>
                </div>
            </div>
        </main>
    );
}
