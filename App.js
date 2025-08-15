import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BookOpenCheck, Brain, Calendar, CheckCircle2, Clock, Flame, Goal, HelpCircle, Layers, PieChart, Play, Plus, Repeat, Settings, Sparkles, Target, Upload } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { format } from "date-fns";

// ===== Utility =====
const uid = () => Math.random().toString(36).slice(2);
const todayStr = () => format(new Date(), "yyyy-MM-dd");

const SUBJECTS = [
  { key: "phy", name: "Physics", color: "from-indigo-500 to-violet-500" },
  { key: "chem", name: "Chemistry", color: "from-emerald-500 to-teal-500" },
  { key: "math", name: "Maths", color: "from-rose-500 to-orange-500" },
];

const DEFAULT_TOPICS = {
  phy: ["Kinematics", "NLM", "Work-Energy-Power", "Rotation", "Fluids", "Thermodynamics", "Waves", "Optics", "Electrostatics", "Current Electricity", "Magnetism", "Modern Physics"],
  chem: ["Physical: Mole Concept", "Thermo & Equilibrium", "Electrochemistry", "Kinetics", "Inorganic: Periodic Table", "Chemical Bonding", "s/p/d/f-block", "Coordination", "Organic: GOC", "Hydrocarbons", "Carbonyls", "Amines & Biomolecules"],
  math: ["Quadratic", "Sequence & Series", "Binomial", "Complex No.", "Matrices & Determinants", "Limit/Continuity/DIFF", "Application of Derivatives", "Integration", "Differential Equations", "Vector/3D", "Probability", "Conics"],
};

// Simple spaced repetition intervals (in days)
const LEITNER_INTERVALS = [0, 1, 3, 7, 15, 30];

function useLocalStorage(key, initial) {
  const [val, setVal] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => localStorage.setItem(key, JSON.stringify(val)), [key, val]);
  return [val, setVal];
}

// ===== Mock Question Bank (tiny demo) =====
const SAMPLE_QUESTIONS = [
  {
    id: uid(),
    subject: "math",
    topic: "Quadratic",
    text: "If α and β are roots of x^2 - 5x + 6 = 0, find α^2 + β^2.",
    options: ["10", "13", "25", "37"],
    answer: 13,
    solution: "For ax^2+bx+c: α+β=5, αβ=6 ⇒ α^2+β^2=(α+β)^2-2αβ=25-12=13.",
  },
  {
    id: uid(),
    subject: "phy",
    topic: "Kinematics",
    text: "A particle starts with u=5 m/s and a=2 m/s². Distance in 4 s?",
    options: ["28 m", "36 m", "44 m", "48 m"],
    answer: 36,
    solution: "s = ut + 1/2 a t^2 = 5*4 + 0.5*2*16 = 20 + 16 = 36 m.",
  },
  {
    id: uid(),
    subject: "chem",
    topic: "Mole Concept",
    text: "Moles in 11 g of CO2? (M=44 g/mol)",
    options: ["0.125", "0.25", "0.5", "2"],
    answer: 0.25,
    solution: "n = m/M = 11/44 = 0.25 mol.",
  },
];

// ===== Components =====
function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-zinc-900/70 shadow-sm p-5 border border-zinc-200/60 dark:border-zinc-800">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm text-zinc-500">{title}</div>
          <div className="text-2xl font-semibold">{value}</div>
          {subtitle && <div className="text-xs text-zinc-500 mt-1">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

function GradientHeader() {
  return (
    <div className="relative overflow-hidden rounded-3xl p-6 sm:p-9 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white shadow-sm">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,white,transparent_60%)]" />
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight flex items-center gap-3">
            <Sparkles className="h-8 w-8" /> JEE Crackr
          </h1>
          <p className="mt-2 text-white/80 max-w-2xl">
            Smart planner + spaced repetition + practice. Built for JEE Mains & Advanced.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="bg-white/15 px-3 py-1 rounded-full">No fluff, only marks ⛳</span>
            <span className="bg-white/15 px-3 py-1 rounded-full">Active recall 🔁</span>
            <span className="bg-white/15 px-3 py-1 rounded-full">Daily grind 🔥</span>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="hidden sm:block">
          <div className="rounded-2xl bg-white/10 p-4">
            <div className="text-sm">Today</div>
            <div className="text-3xl font-semibold">{todayStr()}</div>
            <div className="mt-2 text-xs opacity-80">Let's win one day at a time.</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function AddGoal({ onAdd }) {
  const [goal, setGoal] = useState("");
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5" />
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Add a 2-week goal (e.g., Finish Rotation + Carbonyls + AOD)"
          className="flex-1 bg-transparent outline-none text-sm"
        />
        <button
          onClick={() => {
            if (!goal.trim()) return;
            onAdd({ id: uid(), text: goal.trim(), done: false });
            setGoal("");
          }}
          className="px-3 py-1 rounded-xl bg-zinc-900 text-white text-sm hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Pomodoro() {
  const [mins, setMins] = useState(50);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const totalSeconds = mins * 60 + seconds;
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSeconds((s) => {
        if (mins === 0 && s === 0) {
          setRunning(false);
          return 0;
        }
        if (s === 0) {
          setMins((m) => Math.max(0, m - 1));
          return 59;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, mins]);

  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-5 w-5" /> <div className="font-medium">Focus Timer</div>
      </div>
      <div className="text-4xl font-semibold tracking-tight">{String(mins).padStart(2, "0")}:{String(seconds).padStart(2, "0")}</div>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => setRunning((r) => !r)} className="px-3 py-1 rounded-xl bg-zinc-900 text-white text-sm">
          {running ? "Pause" : "Start"}
        </button>
        <button onClick={() => { setRunning(false); setMins(50); setSeconds(0); }} className="px-3 py-1 rounded-xl bg-zinc-200 text-sm">Reset</button>
      </div>
      <div className="mt-3 text-xs text-zinc-500">Tip: 50/10 deep work cycles. No phone. Write mistakes in a diary.</div>
    </div>
  );
}

function DailyPlan({ topics, onCheck }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center gap-2 mb-3"><Calendar className="h-5 w-5" /><div className="font-medium">Today's Plan</div></div>
      <div className="grid sm:grid-cols-2 gap-2">
        {topics.map((t) => (
          <label key={t.id} className="flex items-start gap-2 p-2 rounded-xl hover:bg-zinc-50 cursor-pointer">
            <input type="checkbox" checked={t.done} onChange={() => onCheck(t.id)} className="mt-1" />
            <div>
              <div className="text-sm font-medium">{t.title}</div>
              <div className="text-xs text-zinc-500">{t.subjectName} • {t.topic}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function Practice({ addReview }) {
  const [qIndex, setQIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const q = SAMPLE_QUESTIONS[qIndex % SAMPLE_QUESTIONS.length];
  const correct = picked !== null && ((typeof q.answer === 'number' ? q.answer.toString() : q.answer) === picked.toString());

  const submit = () => {
    if (picked === null) return;
    addReview({
      id: uid(),
      subject: q.subject,
      topic: q.topic,
      front: q.text,
      back: q.solution,
      box: correct ? 2 : 0,
      next: todayStr(),
    });
  };

  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center gap-2 mb-3"><Brain className="h-5 w-5" /><div className="font-medium">Quick Practice</div></div>
      <div className="text-sm font-medium">{q.text}</div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {q.options.map((opt) => (
          <button
            key={opt}
            onClick={() => setPicked(opt)}
            className={`px-3 py-2 rounded-xl border text-sm ${picked === opt ? "border-zinc-900" : "border-zinc-200"}`}
          >
            {opt}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={submit} className="px-3 py-1 rounded-xl bg-zinc-900 text-white text-sm">Save to Review</button>
        <button onClick={() => { setPicked(null); setQIndex((i) => i + 1); }} className="px-3 py-1 rounded-xl bg-zinc-200 text-sm">Next</button>
      </div>
      {picked !== null && (
        <div className={`mt-3 text-sm ${correct ? "text-emerald-600" : "text-rose-600"}`}>
          {correct ? "Correct!" : "Not quite. Add to review & see solution later."}
        </div>
      )}
    </div>
  );
}

function ReviewQueue({ cards, onReview }) {
  const dueToday = cards.filter((c) => c.next <= todayStr());
  const [idx, setIdx] = useState(0);
  const card = dueToday[idx];

  const rate = (good) => {
    if (!card) return;
    const currentBox = card.box ?? 0;
    const newBox = Math.max(0, Math.min(LEITNER_INTERVALS.length - 1, good ? currentBox + 1 : currentBox - 1));
    const intervalDays = LEITNER_INTERVALS[newBox];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + intervalDays);
    onReview(card.id, { box: newBox, next: format(nextDate, "yyyy-MM-dd") });
    setIdx((i) => i + 1);
  };

  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center gap-2 mb-3"><Repeat className="h-5 w-5" /><div className="font-medium">Spaced Repetition</div> <span className="text-xs text-zinc-500">Due today: {dueToday.length}</span></div>
      {!card ? (
        <div className="text-sm text-zinc-500">No reviews due. Do practice and add cards!</div>
      ) : (
        <div>
          <div className="text-sm font-medium">{card.front}</div>
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-zinc-600">Show solution</summary>
            <div className="mt-2 text-zinc-800">{card.back}</div>
          </details>
          <div className="mt-3 flex items-center gap-2">
            <button onClick={() => rate(false)} className="px-3 py-1 rounded-xl bg-rose-100 text-rose-700 text-sm">Again</button>
            <button onClick={() => rate(true)} className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-700 text-sm">Good</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgressChart({ history }) {
  const data = history.slice(-30);
  return (
    <div className="rounded-2xl border p-4">
      <div className="flex items-center gap-2 mb-3"><PieChart className="h-5 w-5" /><div className="font-medium">Last 30 days</div></div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
            <Tooltip />
            <Area type="monotone" dataKey="tasks" stroke="#6366f1" fillOpacity={1} fill="url(#g1)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function App() {
  const [goals, setGoals] = useLocalStorage("jee_goals", []);
  const [tasks, setTasks] = useLocalStorage("jee_tasks", []); // daily tasks
  const [cards, setCards] = useLocalStorage("jee_cards", []); // SR cards
  const [history, setHistory] = useLocalStorage("jee_history", []); // {date, tasks}
  const [planDate, setPlanDate] = useState(todayStr());
  const [planCount, setPlanCount] = useState(6);

  // Generate or reuse today's plan
  useEffect(() => {
    if (tasks.some((t) => t.date === planDate)) return;
    const picks = [];
    SUBJECTS.forEach((s) => {
      const list = DEFAULT_TOPICS[s.key];
      // pick 2 per subject
      for (let i = 0; i < 2; i++) {
        const title = `${s.name}: ${list[(Math.random() * list.length) | 0]}`;
        picks.push({ id: uid(), title, subject: s.key, subjectName: s.name, topic: title.split(": ")[1], done: false, date: planDate });
      }
    });
    setTasks((prev) => [...prev, ...picks]);
  }, []); // only once on first load

  const todayTasks = useMemo(() => tasks.filter((t) => t.date === planDate).slice(0, planCount), [tasks, planDate, planCount]);
  const completedToday = todayTasks.filter((t) => t.done).length;

  useEffect(() => {
    // update history when tasks ticked
    const d = todayStr();
    const count = tasks.filter((t) => t.date === d && t.done).length;
    setHistory((h) => {
      const idx = h.findIndex((x) => x.date === d);
      if (idx >= 0) {
        const copy = [...h];
        copy[idx] = { date: d, tasks: count };
        return copy;
      }
      return [...h, { date: d, tasks: count }];
    });
  }, [tasks]);

  const toggleTask = (id) => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const addGoal = (g) => setGoals((prev) => [g, ...prev]);
  const reviewUpdate = (id, patch) => setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const addReview = (card) => setCards((prev) => [card, ...prev]);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <GradientHeader />

        <div className="grid md:grid-cols-4 gap-4">
          <StatCard title="Today's tasks" value={`${completedToday}/${todayTasks.length}`} subtitle="Finish the list → sleep" icon={CheckCircle2} />
          <StatCard title="Cards due" value={cards.filter((c) => c.next <= todayStr()).length} subtitle="Spaced repetition" icon={Repeat} />
          <StatCard title="Streak" value={`${history.filter(h => h.tasks>0).length} days`} subtitle="Keep the fire" icon={Flame} />
          <StatCard title="Goals" value={goals.filter(g=>!g.done).length} subtitle="2-week sprints" icon={Goal} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6 items-start">
          <div className="space-y-6 lg:col-span-2">
            <div className="grid md:grid-cols-2 gap-6">
              <Pomodoro />
              <Practice addReview={addReview} />
            </div>
            <DailyPlan topics={todayTasks} onCheck={toggleTask} />
            <ReviewQueue cards={cards} onReview={reviewUpdate} />
          </div>
          <div className="space-y-6">
            <AddGoal onAdd={addGoal} />
            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 mb-3"><Layers className="h-5 w-5" /><div className="font-medium">Plan Controls</div></div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-zinc-600">Date</div>
                  <input type="date" value={planDate} onChange={(e)=>setPlanDate(e.target.value)} className="border rounded-xl px-3 py-1" />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-zinc-600">Tasks per day</div>
                  <input type="number" min={3} max={12} value={planCount} onChange={(e)=>setPlanCount(parseInt(e.target.value)||6)} className="border rounded-xl px-3 py-1 w-24" />
                </div>
              </div>
            </div>

            <ProgressChart history={history} />

            <div className="rounded-2xl border p-4">
              <div className="flex items-center gap-2 mb-2"><HelpCircle className="h-5 w-5" /><div className="font-medium">How to use</div></div>
              <ul className="list-disc list-inside text-sm text-zinc-600 space-y-1">
                <li>Each morning, hit <span className="font-medium">Start</span> on the timer and attack your plan.</li>
                <li>Do <span className="font-medium">Quick Practice</span>. Save tricky Qs to the review queue.</li>
                <li>Finish all boxes in <span className="font-medium">Today's Plan</span>. No carryover.</li>
                <li>Open <span className="font-medium">Spaced Repetition</span> and rate your recall. Repeat daily.</li>
                <li>Set a 2-week goal and protect a 4–6 hr deep-work block daily.</li>
              </ul>
            </div>
          </div>
        </div>

        <footer className="text-xs text-zinc-500 pb-8">
          Built for discipline, not doomscrolling. You got this. ✊
        </footer>
      </div>
    </div>
  );
}
