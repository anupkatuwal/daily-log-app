const ALL_TAGS = ['💪 Full','📉 Flat','🔥 Pumps','😴 Fatigue','💤 Low sleep','🤕 Injury','🧠 Sharp','😵 Brain fog','💧 Dry','🌊 Watery'];

export default function NotesTab({ notes, setNotes }) {
  const set = (field, val) => setNotes(n => ({ ...n, [field]: val }));

  const toggleTag = (tag) =>
    setNotes(n => ({
      ...n,
      tags: n.tags.includes(tag) ? n.tags.filter(t => t !== tag) : [...n.tags, tag],
    }));

  return (
    <>
      <div className="card">
        <div className="card-header"><span className="card-title">📏 Body metrics</span></div>
        <div className="card-body">
          <div className="row-3">
            <div className="field">
              <label className="field-label">Weight (kg)</label>
              <input type="number" step="0.1" placeholder="84.0" value={notes.weight}
                onChange={e => set('weight', e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">Waist (in)</label>
              <input type="number" step="0.25" placeholder="32" value={notes.waist}
                onChange={e => set('waist', e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">Sleep (h)</label>
              <input type="number" step="0.5" placeholder="7" value={notes.sleep}
                onChange={e => set('sleep', e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">🚩 How you feel</span></div>
        <div className="card-body">
          <div className="tag-wrap">
            {ALL_TAGS.map(tag => (
              <button key={tag} className={`tag ${notes.tags.includes(tag) ? 'on' : ''}`}
                onClick={() => toggleTag(tag)}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">📝 Notes</span></div>
        <div className="card-body">
          <textarea placeholder="Injury details, posing observations, side effects, anything..."
            value={notes.freeText} onChange={e => set('freeText', e.target.value)} />
        </div>
      </div>
    </>
  );
}
