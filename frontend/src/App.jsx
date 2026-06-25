import { useState, useMemo } from 'react';
import Header       from './components/Header';
import LoginScreen  from './components/LoginScreen';
import FoodTab,     { newFood }    from './components/FoodTab';
import PEDsTab      from './components/PEDsTab';
import TrainingTab  from './components/TrainingTab';
import NotesTab     from './components/NotesTab';
import SummaryTab   from './components/SummaryTab';
import HistoryTab   from './components/HistoryTab';
import { upsertLog } from './lib/api';

/* ── Initial state ─────────────────────────────────────────────────────── */
let _id = 0;
const uid = () => ++_id;

const INITIAL_MEALS = [
  { id: 'm1', name: 'Meal 1', icon: '🌅', time: '14:00', foods: [newFood()] },
  { id: 'm2', name: 'Meal 2', icon: '⚡', time: '17:30', foods: [newFood()] },
  { id: 'm3', name: 'Meal 3', icon: '🌙', time: '20:00', foods: [newFood()] },
];

const INITIAL_PEDS = [
  { id: uid(), name: 'Test P',      dose: '150',  unit: 'mg',  route: 'inj',  taken: false },
  { id: uid(), name: 'Tren A',      dose: '75',   unit: 'mg',  route: 'inj',  taken: false },
  { id: uid(), name: 'Mast P',      dose: '150',  unit: 'mg',  route: 'inj',  taken: false },
  { id: uid(), name: 'Anavar',      dose: '20',   unit: 'mg',  route: 'oral', taken: false },
  { id: uid(), name: 'Clen',        dose: '40',   unit: 'mcg', route: 'oral', taken: false },
  { id: uid(), name: 'T3',          dose: '25',   unit: 'mcg', route: 'oral', taken: false },
  { id: uid(), name: 'Semaglutide', dose: '0.24', unit: 'mg',  route: 'sub',  taken: false },
  { id: uid(), name: 'HGH',         dose: '2',    unit: 'IU',  route: 'sub',  taken: false },
  { id: uid(), name: 'Anastrozole', dose: '0.5',  unit: 'mg',  route: 'oral', taken: false },
  { id: uid(), name: 'hCG',         dose: '500',  unit: 'iu',  route: 'sub',  taken: false },
  { id: uid(), name: 'Prami',       dose: '0.25', unit: 'mg',  route: 'oral', taken: false },
];

/* ── Helpers ────────────────────────────────────────────────────────────── */
function computeTotals(meals) {
  let p = 0, c = 0, f = 0;
  meals.forEach(m => m.foods.forEach(food => {
    p += parseFloat(food.p) || 0;
    c += parseFloat(food.c) || 0;
    f += parseFloat(food.f) || 0;
  }));
  return { p, c, f, kcal: Math.round(p * 4 + c * 4 + f * 9) };
}

function buildPayload(date, meals, peds, training, notes) {
  return {
    log_date:   date,
    bodyweight: parseFloat(notes.weight) || null,
    meals: meals.map((meal, i) => ({
      name:       `${meal.icon} ${meal.name}`,
      sort_order: i,
      food_items: meal.foods.filter(f => f.name.trim()).map((f, j) => ({
        name:      f.name,
        quantity:  1,
        unit:      'serving',
        calories:  Math.round((parseFloat(f.p)||0)*4 + (parseFloat(f.c)||0)*4 + (parseFloat(f.f)||0)*9),
        protein_g: parseFloat(f.p) || 0,
        carbs_g:   parseFloat(f.c) || 0,
        fat_g:     parseFloat(f.f) || 0,
        sort_order: j,
      })),
    })),
    peds: peds.filter(p => p.name.trim()).map(p => ({
      compound: p.name,
      dose:     parseFloat(p.dose) || null,
      unit:     p.unit,
      route:    p.route === 'inj' ? 'injection' : p.route === 'sub' ? 'subcutaneous' : 'oral',
      notes:    p.taken ? 'taken' : null,
    })),
    sessions: training.exercises.filter(e => e.name.trim()).length ? [{
      name:         training.muscleGroup || 'Workout',
      duration_min: parseInt(training.duration) || null,
      notes: [training.feel, training.cardioType,
              training.cardioDur ? `${training.cardioDur}min cardio` : '']
        .filter(Boolean).join(' | ') || null,
      exercises: training.exercises.filter(e => e.name.trim()).map((ex, i) => ({
        name:         ex.name,
        muscle_group: ex.equipType || null,
        sort_order:   i,
        sets: ex.sets.map((s, j) => ({
          set_number:  j + 1,
          reps:        parseInt(s.reps)    || null,
          weight:      parseFloat(s.weight) || null,
          weight_unit: 'kg',
          rpe:         parseFloat(s.rpe)   || null,
        })),
      })),
    }] : [],
    notes: (() => {
      const lines = [];
      if (notes.waist)          lines.push(`Waist: ${notes.waist}"`);
      if (notes.sleep)          lines.push(`Sleep: ${notes.sleep}h`);
      if (notes.tags.length)    lines.push(`Feel: ${notes.tags.join(', ')}`);
      if (notes.freeText.trim()) lines.push(notes.freeText);
      return lines.length ? [{ content: lines.join('\n') }] : [];
    })(),
  };
}

/* ── App ────────────────────────────────────────────────────────────────── */
export default function App() {
  const [token,     setToken]     = useState(() => localStorage.getItem('token') || '');
  const [activeTab, setActiveTab] = useState('food');
  const [meals,     setMeals]     = useState(INITIAL_MEALS);
  const [peds,      setPeds]      = useState(INITIAL_PEDS);
  const [training,  setTraining]  = useState({ muscleGroup: '', duration: '', feel: '', cardioType: '', cardioDur: '', exercises: [] });
  const [notes,     setNotes]     = useState({ weight: '', waist: '', sleep: '', tags: [], freeText: '' });
  const [targets,   setTargets]   = useState({ kcal: 2000, p: 180, c: 180, f: 65 });
  const [toastMsg,  setToastMsg]  = useState('');
  const [toastOn,   setToastOn]   = useState(false);

  const totals = useMemo(() => computeTotals(meals), [meals]);

  const showToast = (msg) => {
    setToastMsg(msg); setToastOn(true);
    setTimeout(() => setToastOn(false), 2600);
  };

  const handleSave = async () => {
    const today = new Date().toISOString().split('T')[0];
    try {
      await upsertLog(token, buildPayload(today, meals, peds, training, notes));
      showToast('✅ Saved — ' + today);
    } catch (err) {
      showToast('❌ ' + err.message);
    }
  };

  if (!token) {
    return <LoginScreen onLogin={t => { localStorage.setItem('token', t); setToken(t); }} />;
  }

  return (
    <>
      <Header totals={totals} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="panels">
        <div className="panel">
          {activeTab === 'food'     && <FoodTab meals={meals} setMeals={setMeals} token={token} />}
          {activeTab === 'peds'     && <PEDsTab peds={peds} setPeds={setPeds} />}
          {activeTab === 'training' && <TrainingTab training={training} setTraining={setTraining} />}
          {activeTab === 'notes'    && <NotesTab notes={notes} setNotes={setNotes} />}
          {activeTab === 'summary'  && <SummaryTab totals={totals} targets={targets} setTargets={setTargets} meals={meals} />}
          {activeTab === 'history'  && <HistoryTab token={token} showToast={showToast} />}
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 20px 32px', background: 'linear-gradient(transparent, var(--bg) 40%)', zIndex: 40 }}>
        <button className="btn-primary" onClick={handleSave}>💾 Save today's log</button>
      </div>
      <div style={{ height: 100 }} />

      <div className={`toast ${toastOn ? 'show' : ''}`}>{toastMsg}</div>
    </>
  );
}
