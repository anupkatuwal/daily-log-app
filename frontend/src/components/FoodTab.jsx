import { useState } from 'react';
import { estimateMacros } from '../lib/api';

let _id = 100;
export const newFood = () => ({ id: _id++, name: '', p: '', c: '', f: '' });

function EstimateModal({ food, onClose, onEstimate, token, loading }) {
  const [input, setInput] = useState('');

  const handleEstimate = async () => {
    try {
      const result = await estimateMacros(token, input);
      onEstimate(result);
      setInput('');
      onClose();
    } catch (err) {
      alert('Estimation failed: ' + err.message);
    }
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Estimate macros</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
          Describe the food (e.g. "200g chicken breast", "1 scoop whey", "2 eggs")
        </p>
        <div className="field">
          <input type="text" placeholder="e.g. 200g grilled chicken breast"
            value={input} onChange={e => setInput(e.target.value)}
            autoFocus onKeyDown={e => e.key === 'Enter' && handleEstimate} />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button className="btn-primary" style={{ flex: 1 }}
            onClick={handleEstimate} disabled={!input.trim() || loading}>
            {loading ? '…' : '✨ Estimate'}
          </button>
          <button className="btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FoodTab({ meals, setMeals, token }) {
  const [estimateFood, setEstimateFood] = useState(null);
  const [estimating, setEstimating] = useState(false);

  const addFood = (mealId) =>
    setMeals(ms => ms.map(m => m.id === mealId ? { ...m, foods: [...m.foods, newFood()] } : m));

  const removeFood = (mealId, foodId) =>
    setMeals(ms => ms.map(m => m.id === mealId
      ? { ...m, foods: m.foods.filter(f => f.id !== foodId) }
      : m));

  const updateFood = (mealId, foodId, field, val) =>
    setMeals(ms => ms.map(m => m.id === mealId
      ? { ...m, foods: m.foods.map(f => f.id === foodId ? { ...f, [field]: val } : f) }
      : m));

  const handleEstimateResult = (result) => {
    if (estimateFood) {
      updateFood(estimateFood.mealId, estimateFood.foodId, 'p', result.protein_g.toString());
      updateFood(estimateFood.mealId, estimateFood.foodId, 'c', result.carbs_g.toString());
      updateFood(estimateFood.mealId, estimateFood.foodId, 'f', result.fat_g.toString());
    }
    setEstimateFood(null);
  };

  return (
    <>
      {meals.map(meal => {
        let mp = 0, mc = 0, mf = 0;
        meal.foods.forEach(f => {
          mp += parseFloat(f.p) || 0;
          mc += parseFloat(f.c) || 0;
          mf += parseFloat(f.f) || 0;
        });
        const mkcal = Math.round(mp * 4 + mc * 4 + mf * 9);

        return (
          <div key={meal.id} className="card">
            <div className="card-header">
              <span className="card-title">{meal.icon} {meal.name}</span>
              <input type="time" defaultValue={meal.time}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 14, fontFamily: "'JetBrains Mono',monospace", width: 90, outline: 'none', cursor: 'pointer' }} />
            </div>
            <div className="card-body" style={{ paddingBottom: 8 }}>
              {meal.foods.map(food => {
                const kcal = Math.round((parseFloat(food.p)||0)*4 + (parseFloat(food.c)||0)*4 + (parseFloat(food.f)||0)*9);
                return (
                  <div key={food.id} className="food-item">
                    <div className="food-item-name-row">
                      <input type="text" placeholder="Food name (e.g. Chicken breast)"
                        value={food.name} onChange={e => updateFood(meal.id, food.id, 'name', e.target.value)} />
                      <button className="btn-remove" onClick={() => removeFood(meal.id, food.id)}>✕</button>
                    </div>
                    <div className="food-macro-labels">
                      <span className="kcal-lbl">Kcal</span>
                      <span className="p-lbl">Protein g</span>
                      <span className="c-lbl">Carbs g</span>
                      <span className="f-lbl">Fat g</span>
                    </div>
                    <div className="food-macros-row">
                      <input type="number" value={kcal || ''} readOnly
                        style={{ color: 'var(--accent)', fontWeight: 700, cursor: 'default' }} />
                      <input type="number" placeholder="0" min="0" step="0.1"
                        value={food.p} onChange={e => updateFood(meal.id, food.id, 'p', e.target.value)} />
                      <input type="number" placeholder="0" min="0" step="0.1"
                        value={food.c} onChange={e => updateFood(meal.id, food.id, 'c', e.target.value)} />
                      <input type="number" placeholder="0" min="0" step="0.1"
                        value={food.f} onChange={e => updateFood(meal.id, food.id, 'f', e.target.value)} />
                    </div>
                    <button
                      style={{
                        width: '100%', height: 36, marginTop: 8, background: 'var(--accent-dim)',
                        border: '1px solid var(--accent)', borderRadius: 10, color: 'var(--accent)',
                        fontSize: 13, fontWeight: 600, fontFamily: "'Inter',sans-serif", cursor: 'pointer',
                      }}
                      onClick={() => setEstimateFood({ mealId: meal.id, foodId: food.id })}
                    >
                      ✨ Estimate
                    </button>
                  </div>
                );
              })}
              <button className="btn-add" onClick={() => addFood(meal.id)}>＋ Add food</button>
            </div>
            <div className="meal-totals">
              <span className="meal-total-chip chip-kcal">{mkcal} kcal</span>
              <span className="meal-total-chip chip-p">{mp.toFixed(1)}g P</span>
              <span className="meal-total-chip chip-c">{mc.toFixed(1)}g C</span>
              <span className="meal-total-chip chip-f">{mf.toFixed(1)}g F</span>
            </div>
          </div>
        );
      })}

      {estimateFood && (
        <EstimateModal
          food={estimateFood}
          onClose={() => setEstimateFood(null)}
          onEstimate={handleEstimateResult}
          token={token}
          loading={estimating}
        />
      )}
    </>
  );
}
