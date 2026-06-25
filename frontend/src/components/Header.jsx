const DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const TABS   = [
  { id: 'food',     label: '🍽 Food' },
  { id: 'peds',     label: '💉 PEDs' },
  { id: 'training', label: '🏋️ Training' },
  { id: 'notes',    label: '📋 Notes' },
  { id: 'summary',  label: '📊 Summary' },
  { id: 'history',  label: '🗂 History' },
];

export default function Header({ totals, activeTab, onTabChange }) {
  const now = new Date();
  const dateStr = `${DAYS[now.getDay()]} ${MONTHS[now.getMonth()]} ${now.getDate()}`;

  return (
    <div className="app-header">
      <div className="header-top">
        <span className="app-title">Daily Log</span>
        <span className="date-chip">{dateStr}</span>
      </div>
      <div className="macro-strip">
        <div className="macro-tile kcal">
          <div className="val">{totals.kcal}</div>
          <div className="lbl">kcal</div>
        </div>
        <div className="macro-tile pro">
          <div className="val">{Math.round(totals.p)}g</div>
          <div className="lbl">protein</div>
        </div>
        <div className="macro-tile carb">
          <div className="val">{Math.round(totals.c)}g</div>
          <div className="lbl">carbs</div>
        </div>
        <div className="macro-tile fat">
          <div className="val">{Math.round(totals.f)}g</div>
          <div className="lbl">fat</div>
        </div>
      </div>
      <div className="tab-bar">
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => onTabChange(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
