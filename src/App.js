import { useState, useEffect, useCallback } from "react";

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  bg: "#0F172A",
  surface: "#1E293B",
  surfaceHigh: "#273548",
  border: "#334155",
  text: "#F8FAFC",
  textMuted: "#94A3B8",
  teal: "#14B8A6",
  indigo: "#6366F1",
  amber: "#F59E0B",
  rose: "#F43F5E",
  green: "#22C55E",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: ${T.bg}; color: ${T.text}; min-height: 100vh; }
  button { cursor: pointer; font-family: inherit; }
  input, textarea, select { font-family: inherit; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${T.bg}; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
`;

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
const Btn = ({ children, onClick, color = T.teal, outline = false, small = false, disabled = false, style = {} }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      padding: small ? "6px 14px" : "10px 22px",
      fontSize: small ? "13px" : "14px",
      fontWeight: 600,
      borderRadius: "8px",
      border: outline ? `1.5px solid ${color}` : "none",
      background: outline ? "transparent" : color,
      color: outline ? color : "#fff",
      opacity: disabled ? 0.4 : 1,
      transition: "all 0.15s",
      letterSpacing: "0.01em",
      ...style,
    }}
  >
    {children}
  </button>
);

const Card = ({ children, style = {} }) => (
  <div style={{
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: "14px",
    padding: "20px",
    ...style,
  }}>
    {children}
  </div>
);

const Input = ({ value, onChange, placeholder, multiline = false, style = {} }) => {
  const base = {
    width: "100%",
    background: T.bg,
    border: `1.5px solid ${T.border}`,
    borderRadius: "8px",
    padding: "10px 14px",
    color: T.text,
    fontSize: "14px",
    outline: "none",
    ...style,
  };
  return multiline
    ? <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3}
        style={{ ...base, resize: "vertical" }} />
    : <input value={value} onChange={onChange} placeholder={placeholder} style={base} />;
};

const Badge = ({ children, color = T.teal }) => (
  <span style={{
    background: color + "22",
    color,
    border: `1px solid ${color}44`,
    borderRadius: "20px",
    padding: "3px 10px",
    fontSize: "12px",
    fontWeight: 600,
  }}>{children}</span>
);

const ProgressBar = ({ value, max, color = T.teal, height = 8 }) => (
  <div style={{ background: T.border, borderRadius: "999px", height, overflow: "hidden" }}>
    <div style={{
      width: `${Math.min(100, (value / max) * 100)}%`,
      background: color,
      height: "100%",
      borderRadius: "999px",
      transition: "width 0.4s ease",
    }} />
  </div>
);

// ─── APP 1: FLASHCARD QUIZ ────────────────────────────────────────────────────
const defaultCards = [
  { id: 1, q: "What is the powerhouse of the cell?", a: "The mitochondria — organelles that generate ATP through cellular respiration." },
  { id: 2, q: "What is Newton's Second Law?", a: "F = ma — Force equals mass times acceleration." },
  { id: 3, q: "Who wrote 'Romeo and Juliet'?", a: "William Shakespeare, written around 1594–1596." },
  { id: 4, q: "What is the speed of light?", a: "≈ 299,792,458 meters per second in a vacuum." },
];

function FlashcardApp() {
  const [cards, setCards] = useState(defaultCards);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ q: "", a: "" });
  const [known, setKnown] = useState(new Set());

  const cur = cards[idx];

  const go = (dir) => {
    setIdx(i => (i + dir + cards.length) % cards.length);
    setFlipped(false);
  };

  const openAdd = () => { setForm({ q: "", a: "" }); setEditId(null); setShowForm(true); };
  const openEdit = (c) => { setForm({ q: c.q, a: c.a }); setEditId(c.id); setShowForm(true); };

  const save = () => {
    if (!form.q.trim() || !form.a.trim()) return;
    if (editId) {
      setCards(cs => cs.map(c => c.id === editId ? { ...c, ...form } : c));
    } else {
      setCards(cs => [...cs, { id: Date.now(), ...form }]);
    }
    setShowForm(false);
    setFlipped(false);
  };

  const del = (id) => {
    setCards(cs => cs.filter(c => c.id !== id));
    setIdx(i => Math.min(i, cards.length - 2));
    setFlipped(false);
  };

  const markKnown = () => {
    setKnown(s => { const n = new Set(s); n.has(cur.id) ? n.delete(cur.id) : n.add(cur.id); return n; });
  };

  if (!cur) return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: T.textMuted }}>
      <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
      <p style={{ marginBottom: "20px" }}>No cards yet. Add your first one!</p>
      <Btn onClick={openAdd} color={T.indigo}>+ Add Card</Btn>
    </div>
  );

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <div style={{ fontSize: "13px", color: T.textMuted }}>Card {idx + 1} of {cards.length}</div>
          <div style={{ fontSize: "13px", color: T.green, marginTop: "2px" }}>
            ✓ {known.size} known
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <Btn onClick={openAdd} color={T.indigo} small>+ Add</Btn>
          <Btn onClick={() => openEdit(cur)} color={T.amber} outline small>Edit</Btn>
          <Btn onClick={() => del(cur.id)} color={T.rose} outline small>Delete</Btn>
        </div>
      </div>

      {/* Flashcard */}
      <div
        onClick={() => setFlipped(f => !f)}
        style={{
          background: flipped
            ? `linear-gradient(135deg, ${T.indigo}22, ${T.teal}11)`
            : `linear-gradient(135deg, ${T.teal}22, ${T.indigo}11)`,
          border: `1.5px solid ${flipped ? T.indigo : T.teal}55`,
          borderRadius: "18px",
          minHeight: "240px",
          padding: "36px",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          position: "relative",
          transition: "all 0.2s",
          userSelect: "none",
        }}
      >
        <Badge color={flipped ? T.indigo : T.teal}>{flipped ? "ANSWER" : "QUESTION"}</Badge>
        <p style={{ fontSize: "20px", fontWeight: 600, marginTop: "20px", lineHeight: 1.5, color: T.text }}>
          {flipped ? cur.a : cur.q}
        </p>
        <p style={{ fontSize: "12px", color: T.textMuted, position: "absolute", bottom: "14px" }}>
          {flipped ? "Click to see question" : "Click to reveal answer"}
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", gap: "12px" }}>
        <Btn onClick={() => go(-1)} color={T.surfaceHigh} style={{ background: T.surfaceHigh, color: T.text, border: `1px solid ${T.border}` }}>
          ← Prev
        </Btn>
        <Btn
          onClick={markKnown}
          color={known.has(cur.id) ? T.green : T.textMuted}
          outline
        >
          {known.has(cur.id) ? "✓ Known" : "Mark Known"}
        </Btn>
        <Btn onClick={() => go(1)} color={T.surfaceHigh} style={{ background: T.surfaceHigh, color: T.text, border: `1px solid ${T.border}` }}>
          Next →
        </Btn>
      </div>

      {/* Progress */}
      <div style={{ marginTop: "20px" }}>
        <ProgressBar value={known.size} max={cards.length} color={T.green} height={6} />
        <div style={{ fontSize: "12px", color: T.textMuted, marginTop: "6px", textAlign: "right" }}>
          {Math.round((known.size / cards.length) * 100)}% mastered
        </div>
      </div>

      {/* Card list */}
      <div style={{ marginTop: "28px" }}>
        <div style={{ fontSize: "13px", fontWeight: 600, color: T.textMuted, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>All Cards</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {cards.map((c, i) => (
            <div
              key={c.id}
              onClick={() => { setIdx(i); setFlipped(false); }}
              style={{
                background: i === idx ? T.indigo + "22" : T.surface,
                border: `1px solid ${i === idx ? T.indigo : T.border}`,
                borderRadius: "10px",
                padding: "12px 16px",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span style={{ fontSize: "14px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {c.q}
              </span>
              {known.has(c.id) && <span style={{ color: T.green, fontSize: "16px" }}>✓</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div style={{
          position: "fixed", inset: 0, background: "#00000088", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
        }} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <Card style={{ width: "100%", maxWidth: "480px" }}>
            <h3 style={{ marginBottom: "16px" }}>{editId ? "Edit Card" : "New Card"}</h3>
            <label style={{ fontSize: "13px", color: T.textMuted }}>Question</label>
            <Input value={form.q} onChange={e => setForm(f => ({ ...f, q: e.target.value }))} placeholder="Enter question..." style={{ marginTop: "6px", marginBottom: "14px" }} />
            <label style={{ fontSize: "13px", color: T.textMuted }}>Answer</label>
            <Input value={form.a} onChange={e => setForm(f => ({ ...f, a: e.target.value }))} placeholder="Enter answer..." multiline style={{ marginTop: "6px", marginBottom: "20px" }} />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <Btn onClick={() => setShowForm(false)} outline color={T.textMuted}>Cancel</Btn>
              <Btn onClick={save} color={T.indigo}>Save Card</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── APP 2: QUOTE GENERATOR ───────────────────────────────────────────────────
const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "In the middle of every difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "Spread love everywhere you go. Let no one ever come to you without leaving happier.", author: "Mother Teresa" },
  { text: "When you reach the end of your rope, tie a knot in it and hang on.", author: "Franklin D. Roosevelt" },
  { text: "Always remember that you are absolutely unique. Just like everyone else.", author: "Margaret Mead" },
  { text: "Do not go where the path may lead, go instead where there is no path and leave a trail.", author: "Ralph Waldo Emerson" },
  { text: "You will face many defeats in life, but never let yourself be defeated.", author: "Maya Angelou" },
  { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
  { text: "In the end, it's not the years in your life that count. It's the life in your years.", author: "Abraham Lincoln" },
  { text: "Never let the fear of striking out keep you from playing the game.", author: "Babe Ruth" },
  { text: "Life is either a daring adventure or nothing at all.", author: "Helen Keller" },
];

const QUOTE_COLORS = [T.teal, T.indigo, T.amber, T.rose, T.green];

function QuoteApp() {
  const [qIdx, setQIdx] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [colorIdx, setColorIdx] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [anim, setAnim] = useState(true);

  const next = useCallback(() => {
    setAnim(false);
    setTimeout(() => {
      setQIdx(i => {
        let n;
        do { n = Math.floor(Math.random() * QUOTES.length); } while (n === i);
        return n;
      });
      setColorIdx(c => (c + 1) % QUOTE_COLORS.length);
      setAnim(true);
    }, 150);
  }, []);

  const cur = QUOTES[qIdx];
  const color = QUOTE_COLORS[colorIdx];
  const isFav = favorites.includes(qIdx);

  const toggleFav = () => setFavorites(f => f.includes(qIdx) ? f.filter(x => x !== qIdx) : [...f, qIdx]);

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
      {/* Main quote card */}
      <div style={{
        background: `linear-gradient(145deg, ${color}18, ${T.surface})`,
        border: `1.5px solid ${color}44`,
        borderRadius: "20px",
        padding: "48px 40px",
        textAlign: "center",
        transition: "opacity 0.15s",
        opacity: anim ? 1 : 0,
        position: "relative",
        minHeight: "280px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}>
        <div style={{ fontSize: "56px", color, opacity: 0.3, lineHeight: 1, marginBottom: "12px", fontFamily: "Georgia, serif" }}>"</div>
        <p style={{ fontSize: "22px", lineHeight: 1.6, fontWeight: 500, color: T.text, marginBottom: "28px" }}>
          {cur.text}
        </p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "1px", background: color + "66" }} />
          <span style={{ fontSize: "15px", fontWeight: 600, color }}>{cur.author}</span>
          <div style={{ width: "32px", height: "1px", background: color + "66" }} />
        </div>

        <button
          onClick={toggleFav}
          style={{
            position: "absolute", top: "16px", right: "16px",
            background: "none", border: "none",
            fontSize: "22px", cursor: "pointer",
          }}
        >{isFav ? "❤️" : "🤍"}</button>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "12px", marginTop: "20px", justifyContent: "center" }}>
        <Btn onClick={next} color={color} style={{ flex: 1, maxWidth: "220px" }}>
          ✦ New Quote
        </Btn>
        <Btn onClick={() => navigator.clipboard?.writeText(`"${cur.text}" — ${cur.author}`)} color={T.surfaceHigh}
          style={{ background: T.surfaceHigh, color: T.textMuted, border: `1px solid ${T.border}` }} small>
          Copy
        </Btn>
      </div>

      {/* Favorites */}
      {favorites.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: T.textMuted, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            ❤️ Saved Quotes ({favorites.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {favorites.map(fi => (
              <Card key={fi} style={{ padding: "14px 18px" }}>
                <p style={{ fontSize: "14px", color: T.text, lineHeight: 1.5 }}>"{QUOTES[fi].text}"</p>
                <p style={{ fontSize: "12px", color: T.teal, marginTop: "6px" }}>— {QUOTES[fi].author}</p>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── APP 3: FITNESS TRACKER ───────────────────────────────────────────────────
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const EX_TYPES = ["Running", "Walking", "Cycling", "Swimming", "Weights", "Yoga", "HIIT", "Other"];

function FitnessApp() {
  const [logs, setLogs] = useState([
    { id: 1, day: "Mon", type: "Running", duration: 30, calories: 280, steps: 4200 },
    { id: 2, day: "Tue", type: "Weights", duration: 45, calories: 320, steps: 2100 },
    { id: 3, day: "Wed", type: "Cycling", duration: 60, calories: 450, steps: 1500 },
    { id: 4, day: "Thu", type: "Yoga", duration: 40, calories: 150, steps: 800 },
    { id: 5, day: "Fri", type: "HIIT", duration: 25, calories: 380, steps: 3200 },
  ]);
  const [form, setForm] = useState({ day: "Mon", type: "Running", duration: "", calories: "", steps: "" });
  const [showForm, setShowForm] = useState(false);

  const totalCals = logs.reduce((s, l) => s + l.calories, 0);
  const totalSteps = logs.reduce((s, l) => s + l.steps, 0);
  const totalTime = logs.reduce((s, l) => s + l.duration, 0);

  const addLog = () => {
    if (!form.duration || !form.calories) return;
    setLogs(l => [...l, { id: Date.now(), ...form, duration: +form.duration, calories: +form.calories, steps: +(form.steps || 0) }]);
    setShowForm(false);
    setForm({ day: "Mon", type: "Running", duration: "", calories: "", steps: "" });
  };

  const maxCal = Math.max(...logs.map(l => l.calories), 1);

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Calories Burned", value: totalCals.toLocaleString(), unit: "kcal", color: T.rose },
          { label: "Total Steps", value: totalSteps.toLocaleString(), unit: "steps", color: T.amber },
          { label: "Active Time", value: totalTime, unit: "min", color: T.teal },
        ].map(s => (
          <Card key={s.label} style={{ padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: "24px", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: "11px", color: T.textMuted, marginTop: "2px" }}>{s.unit}</div>
            <div style={{ fontSize: "11px", color: T.textMuted, marginTop: "4px" }}>{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Bar chart */}
      <Card style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 600 }}>Calories This Week</h3>
          <Badge color={T.rose}>{totalCals} kcal total</Badge>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "100px" }}>
          {DAYS.map(day => {
            const log = logs.find(l => l.day === day);
            const h = log ? (log.calories / maxCal) * 88 : 4;
            return (
              <div key={day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div style={{
                  width: "100%", height: `${h}px`, background: log ? T.rose : T.border,
                  borderRadius: "4px 4px 2px 2px", transition: "height 0.4s ease",
                  minHeight: "4px",
                }} />
                <span style={{ fontSize: "11px", color: T.textMuted }}>{day}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Step progress */}
      <Card style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
          <span style={{ fontSize: "15px", fontWeight: 600 }}>Weekly Steps</span>
          <span style={{ fontSize: "14px", color: T.amber }}>{totalSteps.toLocaleString()} / 70,000</span>
        </div>
        <ProgressBar value={totalSteps} max={70000} color={T.amber} height={10} />
        <div style={{ fontSize: "12px", color: T.textMuted, marginTop: "8px" }}>
          {Math.round((totalSteps / 70000) * 100)}% of weekly goal
        </div>
      </Card>

      {/* Log list */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: 600 }}>Activity Log</h3>
        <Btn onClick={() => setShowForm(true)} color={T.teal} small>+ Log Activity</Btn>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {logs.map(l => (
          <Card key={l.id} style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <div style={{ background: T.teal + "22", color: T.teal, borderRadius: "8px", padding: "8px 12px", fontWeight: 700, fontSize: "13px" }}>{l.day}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: "14px" }}>{l.type}</div>
                <div style={{ fontSize: "12px", color: T.textMuted }}>{l.duration} min · {l.steps.toLocaleString()} steps</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, color: T.rose }}>{l.calories}</div>
              <div style={{ fontSize: "11px", color: T.textMuted }}>kcal</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "#00000088", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <Card style={{ width: "100%", maxWidth: "420px" }}>
            <h3 style={{ marginBottom: "16px" }}>Log Activity</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ fontSize: "12px", color: T.textMuted }}>Day</label>
                <select value={form.day} onChange={e => setForm(f => ({ ...f, day: e.target.value }))}
                  style={{ width: "100%", marginTop: "6px", background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: "8px", padding: "9px 12px", color: T.text, fontSize: "14px" }}>
                  {DAYS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", color: T.textMuted }}>Exercise</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  style={{ width: "100%", marginTop: "6px", background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: "8px", padding: "9px 12px", color: T.text, fontSize: "14px" }}>
                  {EX_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              {[["Duration (min)", "duration"], ["Calories", "calories"], ["Steps", "steps"]].map(([label, key]) => (
                <div key={key}>
                  <label style={{ fontSize: "12px", color: T.textMuted }}>{label}</label>
                  <Input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder="0" style={{ marginTop: "6px" }} />
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <Btn onClick={() => setShowForm(false)} outline color={T.textMuted}>Cancel</Btn>
              <Btn onClick={addLog} color={T.teal}>Save</Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── APP 4: LANGUAGE LEARNING ──────────────────────────────────────────────────
const VOCAB = {
  Spanish: [
    { word: "Hola", trans: "Hello", ex: "¡Hola! ¿Cómo estás?", cat: "Greetings" },
    { word: "Gracias", trans: "Thank you", ex: "Muchas gracias por su ayuda.", cat: "Greetings" },
    { word: "Por favor", trans: "Please", ex: "¿Puede ayudarme, por favor?", cat: "Greetings" },
    { word: "Casa", trans: "House / Home", ex: "Mi casa es grande.", cat: "Nouns" },
    { word: "Agua", trans: "Water", ex: "Necesito agua.", cat: "Nouns" },
    { word: "Comer", trans: "To eat", ex: "Me gusta comer pizza.", cat: "Verbs" },
    { word: "Hablar", trans: "To speak", ex: "Ella habla español muy bien.", cat: "Verbs" },
    { word: "Rápido", trans: "Fast / Quick", ex: "El coche es muy rápido.", cat: "Adjectives" },
    { word: "Hermoso", trans: "Beautiful", ex: "Qué paisaje tan hermoso.", cat: "Adjectives" },
    { word: "Siempre", trans: "Always", ex: "Siempre llego tarde.", cat: "Adverbs" },
  ],
  French: [
    { word: "Bonjour", trans: "Hello / Good morning", ex: "Bonjour, comment ça va?", cat: "Greetings" },
    { word: "Merci", trans: "Thank you", ex: "Merci beaucoup!", cat: "Greetings" },
    { word: "S'il vous plaît", trans: "Please", ex: "Un café, s'il vous plaît.", cat: "Greetings" },
    { word: "Maison", trans: "House", ex: "Ma maison est grande.", cat: "Nouns" },
    { word: "Eau", trans: "Water", ex: "J'ai besoin d'eau.", cat: "Nouns" },
    { word: "Manger", trans: "To eat", ex: "J'aime manger du fromage.", cat: "Verbs" },
    { word: "Parler", trans: "To speak", ex: "Elle parle très bien français.", cat: "Verbs" },
    { word: "Rapide", trans: "Fast", ex: "Le train est très rapide.", cat: "Adjectives" },
    { word: "Beau", trans: "Beautiful", ex: "C'est un beau jour.", cat: "Adjectives" },
    { word: "Toujours", trans: "Always", ex: "Il est toujours en retard.", cat: "Adverbs" },
  ],
  Japanese: [
    { word: "こんにちは", trans: "Hello", ex: "こんにちは！元気ですか？", cat: "Greetings" },
    { word: "ありがとう", trans: "Thank you", ex: "ありがとうございます。", cat: "Greetings" },
    { word: "お願い", trans: "Please", ex: "お願いします。", cat: "Greetings" },
    { word: "家 (いえ)", trans: "House / Home", ex: "私の家は大きいです。", cat: "Nouns" },
    { word: "水 (みず)", trans: "Water", ex: "水をください。", cat: "Nouns" },
    { word: "食べる", trans: "To eat", ex: "私はラーメンを食べます。", cat: "Verbs" },
    { word: "話す", trans: "To speak", ex: "日本語を話せますか？", cat: "Verbs" },
    { word: "速い (はやい)", trans: "Fast", ex: "この電車はとても速い。", cat: "Adjectives" },
    { word: "きれい", trans: "Beautiful", ex: "きれいな花ですね。", cat: "Adjectives" },
    { word: "いつも", trans: "Always", ex: "いつも遅れます。", cat: "Adverbs" },
  ],
};

const LANGS = Object.keys(VOCAB);
const CATS = ["All", "Greetings", "Nouns", "Verbs", "Adjectives", "Adverbs"];

function LangApp() {
  const [lang, setLang] = useState("Spanish");
  const [cat, setCat] = useState("All");
  const [tab, setTab] = useState("learn"); // learn | quiz
  const [cardIdx, setCardIdx] = useState(0);
  const [showTrans, setShowTrans] = useState(false);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState({ right: 0, wrong: 0 });
  const [chosen, setChosen] = useState(null);
  const [streak, setStreak] = useState(0);

  const words = VOCAB[lang].filter(w => cat === "All" || w.cat === cat);
  const cur = words[cardIdx % words.length];

  const resetCard = () => { setCardIdx(0); setShowTrans(false); };
  useEffect(resetCard, [lang, cat]);

  // Quiz
  const allWords = VOCAB[lang];
  const qWord = allWords[qIdx % allWords.length];
  const makeOptions = (correct, pool) => {
    const wrong = pool.filter(w => w.word !== correct.word).sort(() => Math.random() - 0.5).slice(0, 3);
    return [...wrong, correct].sort(() => Math.random() - 0.5);
  };
  const [options, setOptions] = useState(() => makeOptions(allWords[0], allWords));
  const nextQ = (correct) => {
    setScore(s => ({ right: s.right + (correct ? 1 : 0), wrong: s.wrong + (correct ? 0 : 1) }));
    setStreak(s => correct ? s + 1 : 0);
    setTimeout(() => {
      const next = (qIdx + 1) % allWords.length;
      setQIdx(next);
      setOptions(makeOptions(allWords[next], allWords));
      setChosen(null);
    }, 800);
  };

  const catCounts = CATS.map(c => ({
    cat: c,
    n: c === "All" ? VOCAB[lang].length : VOCAB[lang].filter(w => w.cat === c).length,
  }));

  return (
    <div style={{ maxWidth: "640px", margin: "0 auto" }}>
      {/* Language selector */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {LANGS.map(l => (
          <button key={l} onClick={() => { setLang(l); resetCard(); setQIdx(0); setChosen(null); }}
            style={{
              padding: "8px 18px", borderRadius: "20px", border: "none", fontWeight: 600, fontSize: "14px", cursor: "pointer",
              background: lang === l ? T.amber : T.surface,
              color: lang === l ? "#fff" : T.textMuted,
              transition: "all 0.15s",
            }}>
            {l === "Spanish" ? "🇪🇸" : l === "French" ? "🇫🇷" : "🇯🇵"} {l}
          </button>
        ))}
      </div>

      {/* Tab */}
      <div style={{ display: "flex", gap: "4px", background: T.surface, padding: "4px", borderRadius: "10px", marginBottom: "20px", width: "fit-content" }}>
        {["learn", "quiz"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: "8px 20px", borderRadius: "7px", border: "none", fontWeight: 600, fontSize: "13px", cursor: "pointer",
              background: tab === t ? T.amber : "transparent",
              color: tab === t ? "#fff" : T.textMuted,
              textTransform: "capitalize",
            }}>
            {t === "learn" ? "📖 Learn" : "🎯 Quiz"}
          </button>
        ))}
      </div>

      {tab === "learn" ? (
        <>
          {/* Category filter */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "20px", flexWrap: "wrap" }}>
            {catCounts.map(({ cat: c, n }) => (
              <button key={c} onClick={() => { setCat(c); resetCard(); }}
                style={{
                  padding: "5px 12px", borderRadius: "20px", border: `1px solid ${cat === c ? T.teal : T.border}`,
                  background: cat === c ? T.teal + "22" : "transparent",
                  color: cat === c ? T.teal : T.textMuted, fontSize: "12px", fontWeight: 600, cursor: "pointer",
                }}>
                {c} ({n})
              </button>
            ))}
          </div>

          {cur && (
            <>
              {/* Word card */}
              <div
                onClick={() => setShowTrans(t => !t)}
                style={{
                  background: `linear-gradient(135deg, ${T.amber}18, ${T.surface})`,
                  border: `1.5px solid ${T.amber}44`,
                  borderRadius: "18px",
                  minHeight: "200px",
                  padding: "36px",
                  textAlign: "center",
                  cursor: "pointer",
                  display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
                  gap: "12px",
                }}>
                <Badge color={T.amber}>{cur.cat}</Badge>
                <div style={{ fontSize: "42px", fontWeight: 800, color: T.text }}>{cur.word}</div>
                {showTrans ? (
                  <>
                    <div style={{ fontSize: "20px", color: T.amber, fontWeight: 600 }}>{cur.trans}</div>
                    <div style={{ fontSize: "14px", color: T.textMuted, fontStyle: "italic", maxWidth: "400px" }}>"{cur.ex}"</div>
                  </>
                ) : (
                  <div style={{ fontSize: "13px", color: T.textMuted }}>Tap to reveal translation</div>
                )}
              </div>

              {/* Navigation */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
                <Btn onClick={() => { setCardIdx(i => Math.max(0, i - 1)); setShowTrans(false); }}
                  color={T.surfaceHigh} style={{ background: T.surfaceHigh, color: T.text, border: `1px solid ${T.border}` }}
                  disabled={cardIdx === 0}>← Prev</Btn>
                <span style={{ fontSize: "13px", color: T.textMuted }}>{Math.min(cardIdx + 1, words.length)} / {words.length}</span>
                <Btn onClick={() => { setCardIdx(i => i + 1); setShowTrans(false); }}
                  color={T.surfaceHigh} style={{ background: T.surfaceHigh, color: T.text, border: `1px solid ${T.border}` }}
                  disabled={cardIdx >= words.length - 1}>Next →</Btn>
              </div>

              {/* All words */}
              <div style={{ marginTop: "24px" }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: T.textMuted, marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Word List</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {words.map((w, i) => (
                    <div key={i} onClick={() => { setCardIdx(i); setShowTrans(false); }}
                      style={{
                        background: i === cardIdx % words.length ? T.amber + "22" : T.surface,
                        border: `1px solid ${i === cardIdx % words.length ? T.amber : T.border}`,
                        borderRadius: "10px", padding: "10px 14px", cursor: "pointer",
                      }}>
                      <div style={{ fontWeight: 600, fontSize: "14px" }}>{w.word}</div>
                      <div style={{ fontSize: "12px", color: T.textMuted }}>{w.trans}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {/* Quiz stats */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            <Card style={{ flex: 1, textAlign: "center", padding: "14px" }}>
              <div style={{ fontSize: "24px", fontWeight: 800, color: T.green }}>{score.right}</div>
              <div style={{ fontSize: "12px", color: T.textMuted }}>Correct</div>
            </Card>
            <Card style={{ flex: 1, textAlign: "center", padding: "14px" }}>
              <div style={{ fontSize: "24px", fontWeight: 800, color: T.rose }}>{score.wrong}</div>
              <div style={{ fontSize: "12px", color: T.textMuted }}>Wrong</div>
            </Card>
            <Card style={{ flex: 1, textAlign: "center", padding: "14px" }}>
              <div style={{ fontSize: "24px", fontWeight: 800, color: T.amber }}>{streak}</div>
              <div style={{ fontSize: "12px", color: T.textMuted }}>Streak 🔥</div>
            </Card>
          </div>

          {/* Question */}
          <Card style={{ textAlign: "center", padding: "32px", marginBottom: "16px", background: `linear-gradient(135deg, ${T.indigo}18, ${T.surface})`, borderColor: T.indigo + "44" }}>
            <div style={{ fontSize: "12px", color: T.textMuted, marginBottom: "8px" }}>What does this mean?</div>
            <div style={{ fontSize: "40px", fontWeight: 800 }}>{qWord.word}</div>
          </Card>

          {/* Options */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {options.map((opt, i) => {
              const isCorrect = opt.word === qWord.word;
              const isChosen = chosen === i;
              let bg = T.surface, border = T.border, color = T.text;
              if (chosen !== null) {
                if (isCorrect) { bg = T.green + "22"; border = T.green; color = T.green; }
                else if (isChosen) { bg = T.rose + "22"; border = T.rose; color = T.rose; }
              }
              return (
                <button key={i} onClick={() => {
                  if (chosen !== null) return;
                  setChosen(i);
                  nextQ(isCorrect);
                }}
                  style={{
                    padding: "16px", borderRadius: "12px", border: `1.5px solid ${border}`,
                    background: bg, color, fontWeight: 600, fontSize: "15px", cursor: chosen !== null ? "default" : "pointer",
                    transition: "all 0.15s", fontFamily: "inherit",
                  }}>
                  {opt.trans}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: "16px" }}>
            <ProgressBar
              value={score.right}
              max={Math.max(score.right + score.wrong, 1)}
              color={T.green}
            />
            <div style={{ fontSize: "12px", color: T.textMuted, marginTop: "6px" }}>
              {score.right + score.wrong > 0
                ? `${Math.round((score.right / (score.right + score.wrong)) * 100)}% accuracy`
                : "Answer your first question!"}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: "flash", label: "Flashcards", icon: "🗂️", color: T.indigo },
  { id: "quote", label: "Quotes", icon: "💬", color: T.teal },
  { id: "fit", label: "Fitness", icon: "🏋️", color: T.rose },
  { id: "lang", label: "Languages", icon: "🌍", color: T.amber },
];

export default function App() {
  const [active, setActive] = useState("flash");
  const cur = TABS.find(t => t.id === active);

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ borderBottom: `1px solid ${T.border}`, padding: "0 20px", background: T.surface + "cc", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <div style={{ display: "flex", gap: "0", overflowX: "auto" }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setActive(t.id)}
                  style={{
                    padding: "16px 20px", border: "none", background: "transparent", cursor: "pointer",
                    color: active === t.id ? t.color : T.textMuted,
                    borderBottom: `2.5px solid ${active === t.id ? t.color : "transparent"}`,
                    fontWeight: active === t.id ? 700 : 500,
                    fontSize: "14px", whiteSpace: "nowrap", transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: "6px",
                  }}>
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "28px 20px 60px" }}>
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
              <span style={{ fontSize: "28px" }}>{cur.icon}</span>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: 800, color: cur.color }}>{cur.label}</h1>
                <p style={{ fontSize: "13px", color: T.textMuted }}>
                  {active === "flash" && "Study smarter with interactive cards"}
                  {active === "quote" && "A dose of daily inspiration"}
                  {active === "fit" && "Track your fitness journey"}
                  {active === "lang" && "Learn words in a new language"}
                </p>
              </div>
            </div>
            {active === "flash" && <FlashcardApp />}
            {active === "quote" && <QuoteApp />}
            {active === "fit" && <FitnessApp />}
            {active === "lang" && <LangApp />}
          </div>
        </div>
      </div>
    </>
  );
}
