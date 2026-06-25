export const PED_DB = {
  'test p':         { cls: 'ok',      msg: '✅ Test P at 300mg/wk — solid base for contest prep. Keeps libido and mood stable while cutting. On track.' },
  'testosterone':   { cls: 'ok',      msg: '✅ Testosterone base looks adequate for maintenance during cut.' },
  'tren a':         { cls: 'caution', msg: '⚠️ Tren A at 150mg/wk — manageable but watch for: night sweats, insomnia, aggression, and rising prolactin. You have Prami on board which helps. If sides escalate, consider dropping to 100mg.' },
  'trenbolone':     { cls: 'caution', msg: '⚠️ Trenbolone — potent compound. Monitor prolactin, cardio endurance, and sleep quality weekly.' },
  'mast p':         { cls: 'ok',      msg: '✅ Mast P at 300mg/wk — great choice pre-contest. Hardening effect, mild AI properties, anti-estrogenic synergy. No issues at this dose.' },
  'masteron':       { cls: 'ok',      msg: '✅ Masteron dose looks appropriate for contest prep hardening.' },
  'anavar':         { cls: 'ok',      msg: '✅ Anavar 20mg preworkout — well-dosed for strength and fullness without excessive liver load. Could go 40mg closer to show if needed. Keep TUDCA/NAC running.' },
  'oxandrolone':    { cls: 'ok',      msg: '✅ Anavar — good pre-contest oral. Watch liver values at higher doses.' },
  'clen':           { cls: 'caution', msg: '⚠️ Clenbuterol 40mcg alternating days — smart protocol. If you start getting hand tremors or HR staying elevated at rest, take 2 full days off. Potassium and taurine help manage cardiac stress.' },
  'clenbuterol':    { cls: 'caution', msg: '⚠️ Clenbuterol — monitor resting HR. Supplement taurine 3-5g/day to reduce cardiac side effects.' },
  't3':             { cls: 'caution', msg: '⚠️ T3 at 25mcg — conservative dose, sensible. Going over 50mcg risks muscle catabolism. Do NOT stop cold turkey — taper down in last 2 weeks before show.' },
  'liothyronine':   { cls: 'caution', msg: '⚠️ T3 — monitor for catabolism signs. Taper off gradually pre-show, never drop cold.' },
  'semaglutide':    { cls: 'info',    msg: 'ℹ️ Semaglutide 1.7mg/wk — significantly suppresses appetite. Make sure you are hitting protein targets despite low hunger. Risk: eating too little protein due to satiety. Track closely.' },
  'hgh':            { cls: 'info',    msg: 'ℹ️ HGH 2IU/day — solid recovery and anti-catabolic dose during cut. Dropping at 5-6 weeks out is smart to avoid water retention on stage. Watch for carpal tunnel or fasting blood glucose issues.' },
  'anastrozole':    { cls: 'ok',      msg: '✅ Anastrozole 0.5mg E3D — appropriate with your Test + Mast stack. Mast already has mild AI effect so this dose should keep E2 in check without crashing it. Signs of crashed E2: dry joints, low libido, mood swings.' },
  'hcg':            { cls: 'ok',      msg: '✅ hCG 500IU E3D — good call for testicular atrophy prevention on long cycle. Keep monitoring for any E2 sensitivity from hCG-driven testosterone conversion.' },
  'prami':          { cls: 'ok',      msg: '✅ Pramipexole 0.25mg nightly — appropriate prolactin control with Tren on board. Take with food to reduce nausea.' },
  'pramipexole':    { cls: 'ok',      msg: '✅ Prami — correct protocol for tren prolactin management. 0.25mg is on the lower effective end which is good for side effect profile.' },
  'metformin':      { cls: 'info',    msg: 'ℹ️ Metformin 500mg BD — helps partition nutrients, manage insulin sensitivity with Sema on board. Good synergy. Can cause GI upset; take with meals.' },
  'rosuvastatin':   { cls: 'info',    msg: 'ℹ️ Rosuvastatin — essential given lipid impact of your stack. Keep running it. Get bloodwork every 8-10 weeks minimum.' },
  'telmisartan':    { cls: 'info',    msg: 'ℹ️ Telmisartan — smart BP management. Tren + Test stack can push BP up. Monitor BP 2x weekly.' },
  'tadalafil':      { cls: 'ok',      msg: '✅ Tadalafil 5mg daily — good for cardiovascular blood flow and Tren-induced sexual dysfunction prevention.' },
  'frag':           { cls: 'info',    msg: 'ℹ️ HGH Frag 176-191 — fat-specific peptide, makes sense mid-prep. Dropping it to simplify the stack close to show is reasonable.' },
  'methylphenidate':{ cls: 'caution', msg: '⚠️ Methylphenidate 80mg/day — high dose. Stimulant load combined with Clen and T3 creates significant cardiovascular strain. Monitor HR and BP daily. Avoid stacking all stimulants at the same time.' },
  'amisulpride':    { cls: 'info',    msg: 'ℹ️ Amisulpride 200mg OD (tapering) — dopamine antagonist at low doses; monitor for prolactin elevation as it can raise prolactin slightly, potentially counteracting Prami. Flag to psychiatrist.' },
};

export function getPEDInsight(name) {
  const key = (name || '').toLowerCase().trim();
  for (const k in PED_DB) {
    if (key.includes(k)) return PED_DB[k];
  }
  return { cls: 'info', msg: `ℹ️ "${name}" — no insight on file. Add your dose and route for tracking.` };
}
