function ProgressRow({ label, val, target, color }) {
  const pct = Math.min(100, Math.round((val / target) * 100));
  const over = val > target;
  const c = over ? 'var(--red)' : color;
  return (
    <div className="progress-row">
      <span className="progress-label" style={{ color }}>{label}</span>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%`, background: c }} />
      </div>
      <span className="progress-val" style={{ color: c }}>{Math.round(val)}/{target}</span>
    </div>
  );
}

export default function SummaryTab({ totals, targets, setTargets, meals }) {
  const setTarget = (field, val) => setTargets(t => ({ ...t, [field]: +val || 0 }));

  return (
    <>
      <div className="card">
        <div className="card-header"><span className="card-title">🎯 Daily targets</span></div>
        <div className="card-body">
          <div className="row-2">
            <div className="field">
              <label className="field-label" style={{ color: 'var(--accent)' }}>Kcal target</label>
              <input type="number" value={targets.kcal} onChange={e => setTarget('kcal', e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label" style={{ color: 'var(--green)' }}>Protein (g)</label>
              <input type="number" value={targets.p} onChange={e => setTarget('p', e.target.value)} />
            </div>
          </div>
          <div className="row-2">
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label" style={{ color: 'var(--blue)' }}>Carbs (g)</label>
              <input type="number" value={targets.c} onChange={e => setTarget('c', e.target.value)} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label className="field-label" style={{ color: 'var(--orange)' }}>Fat (g)</label>
              <input type="number" value={targets.f} onChange={e => setTarget('f', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">📊 Macro progress</span></div>
        <div className="card-body">
          <ProgressRow label="Kcal"    val={totals.kcal} target={targets.kcal} color="var(--accent)" />
          <ProgressRow label="Protein" val={totals.p}    target={targets.p}    color="var(--green)" />
          <ProgressRow label="Carbs"   val={totals.c}    target={targets.c}    color="var(--blue)" />
          <ProgressRow label="Fat"     val={totals.f}    target={targets.f}    color="var(--orange)" />
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">🍽 Meal breakdown</span></div>
        <div className="card-body">
          {meals.map(meal => {
            let mp = 0, mc = 0, mf = 0;
            meal.foods.forEach(f => {
              mp += parseFloat(f.p) || 0;
              mc += parseFloat(f.c) || 0;
              mf += parseFloat(f.f) || 0;
            });
            const mkcal = Math.round(mp * 4 + mc * 4 + mf * 9);
            return (
              <div key={meal.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{meal.icon} {meal.name}</span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: 'var(--muted)' }}>
                  <span style={{ color: 'var(--accent)' }}>{mkcal}kcal</span>
                  {' '}{Math.round(mp)}P {Math.round(mc)}C {Math.round(mf)}F
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
