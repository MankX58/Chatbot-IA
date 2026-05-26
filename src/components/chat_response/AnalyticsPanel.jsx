import { useSupportTickets } from '../../hooks/useSupportTickets';
import { formatConfidence, formatTicketDate } from './chatUtils';

function MetricCard({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-400">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-[-0.03em] text-neutral-900">{value}</p>
      <p className="mt-2 text-sm text-neutral-500">{hint}</p>
    </div>
  );
}

export default function AnalyticsPanel() {
  const { tickets, metrics } = useSupportTickets();

  const topCategories = Object.entries(metrics.byBreadcrumb)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);

  const priorityDistribution = Object.entries(metrics.byPriority)
    .sort((left, right) => right[1] - left[1]);

  const unresolvedTickets = tickets
    .filter((ticket) => ticket.unresolved)
    .slice(0, 5);

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-[#f8f9fa] p-4 sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-neutral-900">Dashboard administrativo</h2>
        <p className="text-sm text-neutral-500">
          Resumen operativo construido sobre los tickets almacenados localmente en esta version del MVP.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Consultas" value={metrics.total} hint="Tickets registrados en el navegador." />
        <MetricCard label="Escalados" value={metrics.escalated} hint="Casos enviados a soporte humano." />
        <MetricCard label="En gestion" value={metrics.inProgress} hint="Tickets actualmente trabajados por soporte." />
        <MetricCard label="No resueltos" value={metrics.unresolved} hint="Casos con baja confianza, mala calificacion o abiertos." />
        <MetricCard label="Confianza prom." value={`${metrics.avgConfidence}%`} hint="Promedio de confianza del asistente." />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Tendencias clave</h3>
              <p className="text-sm text-neutral-500">Lectura rapida de volumen, calidad y criticidad.</p>
            </div>
            <span className="rounded-full bg-[#fff5f5] px-3 py-1 text-xs font-semibold text-[#B71C1C]">
              Rating promedio {metrics.avgRating}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400">Categorias mas consultadas</p>
              <div className="mt-4 space-y-3">
                {topCategories.length === 0 ? (
                  <p className="text-sm text-neutral-500">Aun no hay suficiente informacion.</p>
                ) : (
                  topCategories.map(([category, count]) => (
                    <div key={category}>
                      <div className="mb-1 flex items-center justify-between text-sm text-neutral-700">
                        <span>{category}</span>
                        <span>{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-neutral-200">
                        <div
                          className="h-2 rounded-full bg-[#D32F2F]"
                          style={{ width: `${Math.max(12, Math.min(100, (count / Math.max(1, metrics.total)) * 100))}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl bg-neutral-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-neutral-400">Distribucion por prioridad</p>
              <div className="mt-4 space-y-3">
                {priorityDistribution.length === 0 ? (
                  <p className="text-sm text-neutral-500">Aun no hay tickets priorizados.</p>
                ) : (
                  priorityDistribution.map(([priority, count]) => (
                    <div key={priority} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm text-neutral-700">
                      <span>{priority}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-neutral-900">Preguntas no resueltas</h3>
          <p className="mb-4 text-sm text-neutral-500">
            Casos que alimentan la mejora del asistente por baja confianza o mala resolucion.
          </p>

          {unresolvedTickets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-200 p-4 text-sm text-neutral-500">
              No hay casos no resueltos en los tickets actuales.
            </div>
          ) : (
            <div className="space-y-3">
              {unresolvedTickets.map((ticket) => (
                <div key={ticket.id} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#B71C1C]">
                      {ticket.breadcrumb || 'CONSULTA GENERAL'}
                    </span>
                    <span className="text-[11px] text-neutral-400">{formatTicketDate(ticket.date)}</span>
                  </div>
                  <p className="text-sm text-neutral-700">{ticket.preview}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-neutral-500">
                    <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-red-700">
                      {ticket.priority}
                    </span>
                    <span className="rounded-full border border-neutral-200 px-2.5 py-1">
                      Confianza {formatConfidence(ticket.lastConfidence)}
                    </span>
                    {ticket.rating ? (
                      <span className="rounded-full border border-neutral-200 px-2.5 py-1">
                        Rating {ticket.rating}/5
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
