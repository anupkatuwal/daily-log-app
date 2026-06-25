import { getPEDInsight } from '../lib/pedDb';

let _id = 200;

export default function PEDsTab({ peds, setPeds }) {
  const update = (id, field, val) =>
    setPeds(ps => ps.map(p => p.id === id ? { ...p, [field]: val } : p));

  const toggleTaken = (id) =>
    setPeds(ps => ps.map(p => p.id === id ? { ...p, taken: !p.taken } : p));

  const remove = (id) =>
    setPeds(ps => ps.filter(p => p.id !== id));

  const addPed = () => {
    const id = _id++;
    setPeds(ps => [...ps, { id, name: '', dose: '', unit: 'mg', route: 'oral', taken: false }]);
  };

  return (
    <>
      <div className="section-divider">Today's compounds</div>
      {peds.map(ped => {
        const insight = getPEDInsight(ped.name);
        return (
          <div key={ped.id} className="ped-card">
            <div className="ped-top">
              <button className={`ped-taken-toggle ${ped.taken ? 'taken' : ''}`}
                onClick={() => toggleTaken(ped.id)}>
                {ped.taken ? '✅' : '⬜'}
              </button>
              <input type="text" value={ped.name} placeholder="Compound name"
                style={{ fontWeight: 700, fontSize: 16 }}
                onChange={e => update(ped.id, 'name', e.target.value)} />
              <button className="btn-remove" onClick={() => remove(ped.id)}>✕</button>
            </div>
            <div className="row-3">
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field-label">Dose</label>
                <input type="text" value={ped.dose} placeholder="—"
                  style={{ textAlign: 'center', fontFamily: "'JetBrains Mono',monospace", fontWeight: 700 }}
                  onChange={e => update(ped.id, 'dose', e.target.value)} />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field-label">Unit</label>
                <input type="text" value={ped.unit} placeholder="mg"
                  style={{ textAlign: 'center', fontFamily: "'JetBrains Mono',monospace" }}
                  onChange={e => update(ped.id, 'unit', e.target.value)} />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field-label">Route</label>
                <select value={ped.route} onChange={e => update(ped.id, 'route', e.target.value)}>
                  <option value="inj">💉 Inject</option>
                  <option value="oral">💊 Oral</option>
                  <option value="sub">🩺 SubQ</option>
                </select>
              </div>
            </div>
            {ped.name.trim() && (
              <div className={`ped-insight insight-${insight.cls}`}>{insight.msg}</div>
            )}
          </div>
        );
      })}
      <button className="btn-add" onClick={addPed}>＋ Add compound</button>
    </>
  );
}
