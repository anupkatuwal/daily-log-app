let _id = 300;
const newSet  = () => ({ id: _id++, reps: '', weight: '', rpe: '' });
const newExercise = () => ({ id: _id++, name: '', equipType: 'Barbell', sets: [newSet(), newSet(), newSet()] });

export default function TrainingTab({ training, setTraining }) {
  const setField = (field, val) =>
    setTraining(t => ({ ...t, [field]: val }));

  const addExercise = () =>
    setTraining(t => ({ ...t, exercises: [...t.exercises, newExercise()] }));

  const removeExercise = (id) =>
    setTraining(t => ({ ...t, exercises: t.exercises.filter(e => e.id !== id) }));

  const updateExercise = (id, field, val) =>
    setTraining(t => ({
      ...t,
      exercises: t.exercises.map(e => e.id === id ? { ...e, [field]: val } : e),
    }));

  const addSet = (exId) =>
    setTraining(t => ({
      ...t,
      exercises: t.exercises.map(e => e.id === exId ? { ...e, sets: [...e.sets, newSet()] } : e),
    }));

  const updateSet = (exId, setId, field, val) =>
    setTraining(t => ({
      ...t,
      exercises: t.exercises.map(e => e.id === exId
        ? { ...e, sets: e.sets.map(s => s.id === setId ? { ...s, [field]: val } : s) }
        : e),
    }));

  return (
    <>
      <div className="card">
        <div className="card-body">
          <div className="field">
            <label className="field-label">Muscle group</label>
            <select value={training.muscleGroup} onChange={e => setField('muscleGroup', e.target.value)}>
              <option value="">— Select —</option>
              {['Chest','Back','Shoulders','Arms','Quads / Legs','Hamstrings','Calves','Glutes','Full Body','Cardio','Rest day']
                .map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div className="row-2">
            <div className="field">
              <label className="field-label">Duration (min)</label>
              <input type="number" placeholder="90" value={training.duration}
                onChange={e => setField('duration', e.target.value)} />
            </div>
            <div className="field">
              <label className="field-label">Session feel</label>
              <select value={training.feel} onChange={e => setField('feel', e.target.value)}>
                <option value="">—</option>
                <option>💪 Strong</option>
                <option>😤 Average</option>
                <option>💀 Trash</option>
                <option>🔥 PR day</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label className="field-label">Cardio type</label>
            <select value={training.cardioType} onChange={e => setField('cardioType', e.target.value)}>
              <option value="">None</option>
              <option>LISS – Incline treadmill</option>
              <option>LISS – Steady bike</option>
              <option>HIIT</option>
              <option>Stairmaster</option>
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="field-label">Cardio duration (min)</label>
            <input type="number" placeholder="30" value={training.cardioDur}
              onChange={e => setField('cardioDur', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="section-divider">Exercises</div>

      {training.exercises.map(ex => (
        <div key={ex.id} className="exercise-card">
          <div className="ex-header">
            <input type="text" placeholder="Exercise name (e.g. Leg Press)"
              style={{ fontWeight: 700, fontSize: 16 }} value={ex.name}
              onChange={e => updateExercise(ex.id, 'name', e.target.value)} />
            <select value={ex.equipType} style={{ width: 110, fontSize: 14 }}
              onChange={e => updateExercise(ex.id, 'equipType', e.target.value)}>
              {['Barbell','Dumbbell','Cable','Machine','Bodyweight','Smith'].map(v => <option key={v}>{v}</option>)}
            </select>
            <button className="btn-remove" onClick={() => removeExercise(ex.id)}>✕</button>
          </div>
          <div className="set-labels">
            <span>#</span><span>Reps</span><span>kg</span><span>RPE</span>
          </div>
          {ex.sets.map((s, i) => (
            <div key={s.id} className="set-row">
              <div className="set-num">{i + 1}</div>
              <input type="number" placeholder="12" min="0" value={s.reps}
                onChange={e => updateSet(ex.id, s.id, 'reps', e.target.value)} />
              <input type="number" placeholder="kg" min="0" step="2.5" value={s.weight}
                onChange={e => updateSet(ex.id, s.id, 'weight', e.target.value)} />
              <input type="number" placeholder="8" min="1" max="10" step="0.5" value={s.rpe}
                onChange={e => updateSet(ex.id, s.id, 'rpe', e.target.value)} />
            </div>
          ))}
          <button className="btn-add-set" onClick={() => addSet(ex.id)}>＋ Set</button>
        </div>
      ))}

      <button className="btn-add" onClick={addExercise}>＋ Add exercise</button>
    </>
  );
}
