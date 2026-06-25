import { useState, useEffect } from 'react';
import { listLogs, getLog, deleteLog } from '../lib/api';

const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`;
}

function logTotals(log) {
  let kcal = 0, p = 0, c = 0, f = 0;
  (log.meals || []).forEach(meal =>
    (meal.food_items || []).forEach(fi => {
      kcal += fi.calories || 0;
      p    += fi.protein_g || 0;
      c    += fi.carbs_g || 0;
      f    += fi.fat_g || 0;
    })
  );
  return { kcal: Math.round(kcal), p: Math.round(p), c: Math.round(c), f: Math.round(f) };
}

function LogModal({ log, label, onClose, onDelete }) {
  if (!log) return null;
  const t = logTotals(log);
  const pedsTaken = (log.peds || []).filter(p => p.notes === 'taken');
  const session   = (log.sessions || [])[0];

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">{label}</div>

        <div style={{ marginBottom: 16 }}>
          <div className="section-divider" style={{ marginBottom: 8 }}>Macros</div>
          <div className="meal-totals" style={{ background: 'var(--card2)', borderRadius: 12, padding: '12px 14px' }}>
            <span className="meal-total-chip chip-kcal">{t.kcal} kcal</span>
            <span className="meal-total-chip chip-p">{t.p}g P</span>
            <span className="meal-total-chip chip-c">{t.c}g C</span>
            <span className="meal-total-chip chip-f">{t.f}g F</span>
          </div>
        </div>

        {log.bodyweight && (
          <div style={{ marginBottom: 16 }}>
            <div className="section-divider" style={{ marginBottom: 8 }}>Body</div>
            <span style={{ fontSize: 14 }}>⚖️ <b>{log.bodyweight}kg</b></span>
          </div>
        )}

        {pedsTaken.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div className="section-divider" style={{ marginBottom: 8 }}>PEDs taken</div>
            <div style={{ fontSize: 14, lineHeight: 1.8 }}>
              {pedsTaken.map((p, i) => <div key={i}>{p.compound} {p.dose}{p.unit}</div>)}
            </div>
          </div>
        )}

        {session && (
          <div style={{ marginBottom: 16 }}>
            <div className="section-divider" style={{ marginBottom: 8 }}>
              Training — {session.name} {session.notes || ''}
            </div>
            {(session.exercises || []).map((ex, i) => (
              <div key={i} style={{ fontSize: 14, marginBottom: 6 }}>
                <b>{ex.name}</b> — {ex.sets?.length || 0} sets
              </div>
            ))}
          </div>
        )}

        {(log.notes || []).length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div className="section-divider" style={{ marginBottom: 8 }}>Notes</div>
            {log.notes.map((n, i) => (
              <p key={i} style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>{n.content}</p>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>Close</button>
          <button className="btn-remove" style={{ width: 52, height: 52, borderRadius: 12, fontSize: 16 }}
            onClick={onDelete}>🗑</button>
        </div>
      </div>
    </div>
  );
}

export default function HistoryTab({ token, showToast }) {
  const [summaries, setSummaries] = useState([]);
  const [selected, setSelected]   = useState(null);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    setLoading(true);
    listLogs(token)
      .then(setSummaries)
      .catch(err => showToast('❌ ' + err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const openLog = async (dateStr) => {
    try {
      const log = await getLog(token, dateStr);
      setSelected({ log, label: fmtDate(dateStr), date: dateStr });
    } catch (err) {
      showToast('❌ ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    if (!confirm(`Delete log for ${selected.date}?`)) return;
    try {
      await deleteLog(token, selected.date);
      setSummaries(s => s.filter(x => x.log_date !== selected.date));
      setSelected(null);
      showToast('🗑 Deleted');
    } catch (err) {
      showToast('❌ ' + err.message);
    }
  };

  return (
    <>
      <div className="section-divider">Saved logs</div>

      {loading && <div className="empty-state">Loading…</div>}

      {!loading && summaries.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🗂</div>
          No saved logs yet. Hit "Save today's log" to start.
        </div>
      )}

      {summaries.map(s => (
        <div key={s.log_date} className="history-item" onClick={() => openLog(s.log_date)}>
          <div>
            <div className="history-date">{fmtDate(s.log_date)}</div>
            <div className="history-macros">
              {s.bodyweight ? `${s.bodyweight}kg · ` : ''}tap to view
            </div>
          </div>
          <span className="history-chevron">›</span>
        </div>
      ))}

      {selected && (
        <LogModal
          log={selected.log}
          label={selected.label}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
