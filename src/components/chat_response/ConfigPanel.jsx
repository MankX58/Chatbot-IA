import { useCallback, useEffect, useState } from 'react';
import { buildApiUrl } from '../../../config/runtimeConfig';

const HEALTH_ENDPOINT = buildApiUrl('/api/health');

const STATUS_STYLES = {
  checking: 'border-amber-200 bg-amber-50 text-amber-700',
  ready: 'border-green-200 bg-green-50 text-green-700',
  missing: 'border-red-200 bg-red-50 text-red-700',
  error: 'border-red-200 bg-red-50 text-red-700',
};

export default function ConfigPanel() {
  const [status, setStatus] = useState('checking');
  const [details, setDetails] = useState('Validando la configuracion del backend...');
  const [lastCheckAt, setLastCheckAt] = useState('');

  const checkBackendHealth = useCallback(async () => {
    setStatus('checking');
    setDetails('Validando la configuracion del backend...');

    try {
      const response = await fetch(HEALTH_ENDPOINT);
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload?.error || `Error ${response.status}: ${response.statusText}`);
      }

      setStatus(payload.apiConfigured ? 'ready' : 'missing');
      setDetails(
        payload.apiConfigured
          ? 'El backend detecta la variable DEEPSEEK_API_KEY y puede atender solicitudes del chatbot.'
          : 'El backend esta activo, pero falta configurar DEEPSEEK_API_KEY en Vercel.'
      );
      setLastCheckAt(payload.timestamp || new Date().toISOString());
    } catch (error) {
      setStatus('error');
      setDetails(
        `No fue posible validar /api/health. ${error instanceof Error ? error.message : 'Error desconocido.'}`
      );
      setLastCheckAt(new Date().toISOString());
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();
  }, [checkBackendHealth]);

  return (
    <main className="flex min-h-0 flex-1 items-start justify-center bg-[#f8f9fa] px-4 py-4 sm:px-6 sm:py-8 md:py-12">
      <div className="w-full max-w-3xl space-y-6 rounded-2xl border border-neutral-100 bg-white px-4 py-6 shadow sm:px-6 md:px-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="m-0 flex items-center gap-2 text-[1.05rem] font-bold text-[#1a1a2e] sm:text-[1.2rem]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              Configuracion
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              La integracion con DeepSeek ahora corre en el backend. La API key no se solicita ni se guarda en el navegador.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-[10px] border border-[#B71C1C]/15 bg-white px-4 py-2 text-sm font-semibold text-[#B71C1C] transition hover:border-[#B71C1C] hover:bg-[#fff6f6]"
            onClick={checkBackendHealth}
          >
            Revalidar estado
          </button>
        </div>

        <section className={`rounded-2xl border px-4 py-4 sm:px-5 ${STATUS_STYLES[status]}`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em]">
                Estado del backend
              </p>
              <h3 className="mt-1 text-lg font-semibold">
                {status === 'checking' && 'Validando configuracion'}
                {status === 'ready' && 'Servicio listo'}
                {status === 'missing' && 'Falta variable de entorno'}
                {status === 'error' && 'No se pudo verificar'}
              </h3>
            </div>
            <span className="inline-flex w-fit items-center rounded-full border border-current/15 px-3 py-1 text-xs font-semibold">
              {status === 'ready' ? 'OK' : status === 'checking' ? 'CHECKING' : 'ACTION REQUIRED'}
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed">{details}</p>
          {lastCheckAt && (
            <p className="mt-3 text-xs opacity-80">
              Ultima verificacion: {new Date(lastCheckAt).toLocaleString('es-CO')}
            </p>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-5">
            <h3 className="m-0 text-base font-semibold text-[#1a1a2e]">Configuracion esperada en Vercel</h3>
            <ol className="mt-4 space-y-3 pl-5 text-sm leading-relaxed text-neutral-600">
              <li>Entra al proyecto en Vercel.</li>
              <li>Abre Settings y luego Environment Variables.</li>
              <li>Agrega la variable <code className="rounded bg-white px-1 py-0.5 font-mono text-[0.85em]">DEEPSEEK_API_KEY</code>.</li>
              <li>Asigna la variable a Production, Preview y Development segun necesites.</li>
              <li>Haz redeploy para que las funciones serverless carguen el nuevo valor.</li>
            </ol>
          </article>

          <article className="rounded-2xl border border-neutral-100 bg-white px-4 py-5">
            <h3 className="m-0 text-base font-semibold text-[#1a1a2e]">Uso actual de la integracion</h3>
            <div className="mt-4 space-y-4 text-sm text-neutral-600">
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Variable</p>
                <code className="mt-2 block font-mono text-[0.95em] text-neutral-800">DEEPSEEK_API_KEY=tu_api_key</code>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Servidor</p>
                <code className="mt-2 block font-mono text-[0.95em] text-neutral-800">process.env.DEEPSEEK_API_KEY</code>
              </div>
              <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-3">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Frontend opcional</p>
                <code className="mt-2 block font-mono text-[0.95em] text-neutral-800">VITE_API_BASE_URL=https://tu-app.vercel.app</code>
              </div>
              <p className="m-0 leading-relaxed">
                El frontend consume <code className="rounded bg-neutral-100 px-1 py-0.5 font-mono">{HEALTH_ENDPOINT.replace('/health', '/chat')}</code> y el backend es quien firma la llamada a DeepSeek.
              </p>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
