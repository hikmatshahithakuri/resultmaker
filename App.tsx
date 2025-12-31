
import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, UserRole, Student, Subject, Marks, Section, Term, Conduct, 
  StudentReport, SubjectResult, TermData, Expense 
} from './types';
import { INITIAL_USERS, INITIAL_STUDENTS, INITIAL_SUBJECTS } from './constants';
import { calculateSubjectResult, calculateGPA } from './services/gradingService';
import { 
  LayoutDashboard, Users, BookOpen, ClipboardCheck, GraduationCap, 
  LogOut, Plus, Trash2, UserCheck, Calendar, Printer, X, LayoutTemplate, 
  Layers, Wallet, TrendingDown, PieChart, Menu, CheckCircle, AlertTriangle, Save
} from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [allMarks, setAllMarks] = useState<Marks[]>([]);
  const [allTermData, setAllTermData] = useState<TermData[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currentTerm, setCurrentTerm] = useState<Term>(Term.FIRST);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'subjects' | 'marks' | 'results' | 'users' | 'expenses'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Persistence
  useEffect(() => {
    const load = (key: string, def: any) => {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : def;
    };
    setStudents(load('k_students', INITIAL_STUDENTS));
    setSubjects(load('k_subjects', INITIAL_SUBJECTS));
    setAllMarks(load('k_marks', []));
    setAllTermData(load('k_termdata', []));
    setUsers(load('k_users', INITIAL_USERS));
    setExpenses(load('k_expenses', []));
  }, []);

  useEffect(() => {
    localStorage.setItem('k_students', JSON.stringify(students));
    localStorage.setItem('k_subjects', JSON.stringify(subjects));
    localStorage.setItem('k_marks', JSON.stringify(allMarks));
    localStorage.setItem('k_termdata', JSON.stringify(allTermData));
    localStorage.setItem('k_users', JSON.stringify(users));
    localStorage.setItem('k_expenses', JSON.stringify(expenses));
  }, [students, subjects, allMarks, allTermData, users, expenses]);

  const handleLogin = (e: React.FormEvent, form: any) => {
    e.preventDefault();
    const user = users.find(u => u.username === form.username && u.password === form.password);
    if (user) setCurrentUser(user); else alert('Invalid credentials');
  };

  const currentReports = useMemo(() => {
    return students.map(student => {
      const results = subjects.map(sub => {
        const m = allMarks.find(mk => mk.studentId === student.id && mk.subjectId === sub.id && mk.term === currentTerm) || 
                  { studentId: student.id, subjectId: sub.id, term: currentTerm, theoryObtained: 0, practicalObtained: 0 };
        return calculateSubjectResult(sub, m);
      });
      const td = allTermData.find(t => t.studentId === student.id && t.term === currentTerm) || 
                 { attendancePresent: 0, attendanceTotal: 0, conduct: Conduct.GOOD };
      return {
        student, term: currentTerm, results,
        gpa: calculateGPA(results),
        hasNG: results.some(r => r.isNG),
        ...td
      } as StudentReport;
    });
  }, [students, subjects, allMarks, allTermData, currentTerm]);

  if (!currentUser) return <Login onLogin={handleLogin} />;

  const isAdmin = currentUser.role === UserRole.ADMIN;

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-[#1e293b]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#0f172a] text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} print-hidden shadow-2xl`}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20"><GraduationCap className="w-7 h-7" /></div>
              <span className="font-black text-xl tracking-tighter">KANKALI PRO</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400 hover:text-white"><X /></button>
          </div>
          <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
            <SidebarLink icon={<LayoutDashboard />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} />
            <SidebarLink icon={<Users />} label="Students" active={activeTab === 'students'} onClick={() => { setActiveTab('students'); setSidebarOpen(false); }} />
            <SidebarLink icon={<BookOpen />} label="Subjects" active={activeTab === 'subjects'} onClick={() => { setActiveTab('subjects'); setSidebarOpen(false); }} />
            <SidebarLink icon={<ClipboardCheck />} label="Marks Entry" active={activeTab === 'marks'} onClick={() => { setActiveTab('marks'); setSidebarOpen(false); }} />
            <SidebarLink icon={<Layers />} label="Results" active={activeTab === 'results'} onClick={() => { setActiveTab('results'); setSidebarOpen(false); }} />
            <SidebarLink icon={<Wallet />} label="Expenses" active={activeTab === 'expenses'} onClick={() => { setActiveTab('expenses'); setSidebarOpen(false); }} />
            {isAdmin && <SidebarLink icon={<ShieldCheck />} label="Users" active={activeTab === 'users'} onClick={() => { setActiveTab('users'); setSidebarOpen(false); }} />}
          </nav>
          <div className="p-6 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-black text-sm uppercase">{currentUser.name.charAt(0)}</div>
              <div className="overflow-hidden">
                <p className="font-bold text-xs truncate">{currentUser.name}</p>
                <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest">{currentUser.role}</p>
              </div>
            </div>
            <button onClick={() => setCurrentUser(null)} className="p-2 text-slate-500 hover:text-red-400 transition-colors"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col w-full">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 p-6 flex justify-between items-center print-hidden">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg"><Menu /></button>
            <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">{activeTab}</h2>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Calendar className="w-4 h-4 text-blue-500" />
            <select className="bg-transparent font-black text-xs text-slate-600 outline-none cursor-pointer" value={currentTerm} onChange={e => setCurrentTerm(e.target.value as Term)}>
              {Object.values(Term).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </header>

        <div className="p-4 lg:p-8 flex-1">
          {activeTab === 'dashboard' && <Dashboard reports={currentReports} expenses={expenses} />}
          {activeTab === 'students' && <StudentManager students={students} setStudents={setStudents} isAdmin={isAdmin} />}
          {activeTab === 'subjects' && <SubjectManager subjects={subjects} setSubjects={setSubjects} isAdmin={isAdmin} />}
          {activeTab === 'marks' && <MarksEntry students={students} subjects={subjects} marks={allMarks} setMarks={setAllMarks} termData={allTermData} setTermData={setAllTermData} currentTerm={currentTerm} />}
          {activeTab === 'results' && <Results reports={currentReports} subjects={subjects} currentTerm={currentTerm} />}
          {activeTab === 'expenses' && <ExpenseManager expenses={expenses} setExpenses={setExpenses} />}
          {activeTab === 'users' && <UserManager users={users} setUsers={setUsers} currentUserId={currentUser.id} />}
        </div>
      </main>
    </div>
  );
};

// --- Sub-Components ---

// Fixed: Added generic type React.ReactElement<any> to allow 'size' property when cloning
const SidebarLink = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
    {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
    <span className="tracking-tight text-sm">{label}</span>
  </button>
);

const Dashboard = ({ reports, expenses }: any) => {
  const totalStudents = reports.length;
  const passed = reports.filter((r:any) => !r.hasNG && r.results.length > 0).length;
  const totalExpense = expenses.reduce((acc:any, curr:any) => acc + curr.amount, 0);
  
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard label="Total Students" value={totalStudents} icon={<Users />} color="blue" />
        <DashboardCard label="Passed Candidates" value={passed} icon={<UserCheck />} color="green" />
        <DashboardCard label="Success Rate" value={totalStudents ? `${((passed/totalStudents)*100).toFixed(1)}%` : '0%'} icon={<PieChart />} color="purple" />
        <DashboardCard label="Total Expenses" value={`रू ${totalExpense.toLocaleString()}`} icon={<Wallet />} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-black mb-6 flex items-center gap-3">
            <TrendingDown className="text-red-500" /> Recent Performance Map
          </h3>
          <div className="space-y-3">
             {reports.slice(0, 5).map((r:any) => (
               <div key={r.student.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl hover:bg-blue-50 transition-colors">
                 <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black ${r.hasNG ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>{r.student.rollNo}</div>
                 <div className="flex-1">
                   <p className="font-bold text-sm uppercase">{r.student.name}</p>
                   <p className="text-[9px] text-slate-400 font-black uppercase">Section {r.student.section}</p>
                 </div>
                 <div className="text-right">
                   <p className="font-black text-lg">{(r.hasNG ? 0.00 : r.gpa).toFixed(2)}</p>
                   <p className="text-[9px] font-black uppercase text-slate-300">GPA</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
        <div className="bg-[#0f172a] text-white p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-5 rotate-12"><GraduationCap size={200} /></div>
          <h3 className="text-xl font-black mb-2">School Demographics</h3>
          <p className="text-slate-400 text-xs mb-8 uppercase tracking-widest">Section Map Overview</p>
          <div className="space-y-6 relative z-10">
            <MapStat label="Section A" val={reports.filter((r:any) => r.student.section === 'A').length} total={totalStudents} color="bg-blue-500" />
            <MapStat label="Section B" val={reports.filter((r:any) => r.student.section === 'B').length} total={totalStudents} color="bg-indigo-500" />
            <MapStat label="Full Subjects" val={7} total={10} color="bg-green-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Fixed: Added generic type React.ReactElement<any> to allow 'size' property when cloning
const DashboardCard = ({ label, value, icon, color }: any) => {
  const styles: any = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    purple: "text-purple-600 bg-purple-50",
    red: "text-red-600 bg-red-50"
  };
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm group hover:border-blue-200 transition-all">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${styles[color]}`}>
        {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-800 tracking-tighter">{value}</p>
    </div>
  );
};

const MapStat = ({ label, val, total, color }: any) => {
  const perc = total ? (val / total) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-[10px] font-black uppercase mb-2">
        <span>{label}</span>
        <span className="text-slate-400">{val} Units</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${perc}%` }}></div>
      </div>
    </div>
  );
};

// --- Managers ---

const StudentManager = ({ students, setStudents, isAdmin }: any) => {
  const [showForm, setShowForm] = useState(false);
  const [f, setF] = useState({ name: '', roll: '', sec: Section.A });
  const add = (e: any) => {
    e.preventDefault();
    setStudents([...students, { id: Date.now().toString(), name: f.name, rollNo: f.roll, section: f.sec }]);
    setShowForm(false);
    setF({ name: '', roll: '', sec: Section.A });
  };
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black tracking-tighter">Student Directory</h3>
        {isAdmin && <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-blue-700 shadow-lg transition-all">
          {showForm ? <X /> : <Plus />} {showForm ? 'Close' : 'Add Student'}
        </button>}
      </div>
      {showForm && (
        <form onSubmit={add} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 animate-in zoom-in-95 duration-300">
          <InputField label="Student Full Name" value={f.name} onChange={(v:any) => setF({...f, name: v})} required />
          <InputField label="Roll Number" value={f.roll} onChange={(v:any) => setF({...f, roll: v})} required />
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-2">Assign Section</label>
            <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 outline-none focus:border-blue-500 transition-all" value={f.sec} onChange={e => setF({...f, sec: e.target.value as Section})}>
              <option value={Section.A}>Section A</option>
              <option value={Section.B}>Section B</option>
            </select>
          </div>
          <button className="md:col-span-3 bg-slate-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all">Enroll Student Record</button>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.sort((a:any, b:any) => parseInt(a.rollNo) - parseInt(b.rollNo)).map((s:any) => (
          <div key={s.id} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 flex items-center justify-between group hover:border-blue-500 transition-all shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center font-black text-sm text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">{s.rollNo}</div>
              <div>
                <p className="font-bold text-slate-800 uppercase text-sm">{s.name}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase">Section {s.section}</p>
              </div>
            </div>
            {isAdmin && <button onClick={() => { if(confirm('Delete?')) setStudents(students.filter((x:any) => x.id !== s.id)) }} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>}
          </div>
        ))}
      </div>
    </div>
  );
};

const SubjectManager = ({ subjects, setSubjects, isAdmin }: any) => {
  const [showForm, setShowForm] = useState(false);
  const [f, setF] = useState({ 
    name: '', code: '', creditHour: '2.5', thFull: '50', thPass: '18', prFull: '50', prPass: '18' 
  });

  const add = (e: any) => {
    e.preventDefault();
    setSubjects([...subjects, { 
      id: Date.now().toString(), 
      name: f.name, 
      code: f.code, 
      creditHour: parseFloat(f.creditHour), 
      fullMarksTheory: parseFloat(f.thFull), 
      passMarksTheory: parseFloat(f.thPass), 
      fullMarksPractical: parseFloat(f.prFull), 
      passMarksPractical: parseFloat(f.prPass) 
    }]);
    setShowForm(false);
    setF({ name: '', code: '', creditHour: '2.5', thFull: '50', thPass: '18', prFull: '50', prPass: '18' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black tracking-tighter">Academic Curriculum</h3>
        {isAdmin && <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-blue-700 shadow-xl transition-all">
          {showForm ? <X /> : <Plus />} {showForm ? 'Close' : 'Add Subject'}
        </button>}
      </div>
      {showForm && (
        <form onSubmit={add} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in zoom-in-95 duration-300">
          <InputField label="Subject Name" value={f.name} onChange={(v:any) => setF({...f, name: v})} required />
          <InputField label="Subject Code" value={f.code} onChange={(v:any) => setF({...f, code: v})} required />
          <InputField label="Credit Hour" type="number" step="0.5" value={f.creditHour} onChange={(v:any) => setF({...f, creditHour: v})} required />
          <div className="lg:col-span-1"></div>
          <InputField label="TH Full Marks" type="number" value={f.thFull} onChange={(v:any) => setF({...f, thFull: v})} required />
          <InputField label="TH Pass Marks" type="number" value={f.thPass} onChange={(v:any) => setF({...f, thPass: v})} required />
          <InputField label="PR Full Marks" type="number" value={f.prFull} onChange={(v:any) => setF({...f, prFull: v})} required />
          <InputField label="PR Pass Marks" type="number" value={f.prPass} onChange={(v:any) => setF({...f, prPass: v})} required />
          <button className="lg:col-span-4 bg-slate-800 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all">Add New Subject</button>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((sub:any) => (
          <div key={sub.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:border-blue-400 transition-all">
             <div className="absolute top-0 right-0 p-4 font-black text-[10px] text-slate-300 group-hover:text-blue-200">{sub.code}</div>
             <h4 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tighter">{sub.name}</h4>
             <div className="flex justify-between text-[9px] font-black text-slate-400 mb-6 uppercase tracking-widest">
               <span>Credits: {sub.creditHour}</span>
               <span className="text-blue-500">Secondary Level</span>
             </div>
             <div className="grid grid-cols-2 gap-3">
               <div className="bg-slate-50 p-3 rounded-xl">
                 <p className="text-[8px] font-black text-slate-400 uppercase mb-1">TH</p>
                 <p className="font-bold text-xs text-slate-700">{sub.passMarksTheory} / {sub.fullMarksTheory}</p>
               </div>
               <div className="bg-slate-50 p-3 rounded-xl">
                 <p className="text-[8px] font-black text-slate-400 uppercase mb-1">PR</p>
                 <p className="font-bold text-xs text-slate-700">{sub.passMarksPractical} / {sub.fullMarksPractical}</p>
               </div>
             </div>
             {isAdmin && <button onClick={() => { if(confirm('Delete?')) setSubjects(subjects.filter((x:any) => x.id !== sub.id)) }} className="absolute bottom-4 right-4 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>}
          </div>
        ))}
      </div>
    </div>
  );
};

const MarksEntry = ({ students, subjects, marks, setMarks, termData, setTermData, currentTerm }: any) => {
  const [sec, setSec] = useState(Section.A);
  const filtered = students.filter((s:any) => s.section === sec).sort((a:any, b:any) => parseInt(a.rollNo) - parseInt(b.rollNo));

  // Temporary local state for editing before saving
  const [tempMarks, setTempMarks] = useState<any[]>([]);
  const [tempTermData, setTempTermData] = useState<any[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTempMarks(marks.filter((m:any) => m.term === currentTerm));
    setTempTermData(termData.filter((td:any) => td.term === currentTerm));
    setHasChanges(false);
  }, [currentTerm, marks, termData]);

  const updateMark = (sid: string, subid: string, type: 'th' | 'pr', val: string, fullMarks: number) => {
    const n = parseFloat(val) || 0;
    if (n > fullMarks || n < 0) {
      alert(`Invalid! Mark must be between 0 and ${fullMarks}`);
      return;
    }
    setHasChanges(true);
    setTempMarks(prev => {
      const idx = prev.findIndex(m => m.studentId === sid && m.subjectId === subid);
      if (idx > -1) {
        const copy = [...prev];
        if (type === 'th') copy[idx].theoryObtained = n; else copy[idx].practicalObtained = n;
        return copy;
      }
      return [...prev, { studentId: sid, subjectId: subid, term: currentTerm, theoryObtained: type === 'th' ? n : 0, practicalObtained: type === 'pr' ? n : 0 }];
    });
  };

  const updateTD = (sid: string, field: string, val: any) => {
    setHasChanges(true);
    setTempTermData(prev => {
      const idx = prev.findIndex(td => td.studentId === sid);
      if (idx > -1) {
        const copy = [...prev];
        copy[idx][field] = val;
        return copy;
      }
      const newItem = { studentId: sid, term: currentTerm, attendancePresent: 0, attendanceTotal: 0, conduct: Conduct.GOOD };
      (newItem as any)[field] = val;
      return [...prev, newItem];
    });
  };

  const handleSave = () => {
    // Overwrite global marks/termData for THIS term
    setMarks((prev: any[]) => {
      const others = prev.filter((m:any) => m.term !== currentTerm);
      return [...others, ...tempMarks];
    });
    setTermData((prev: any[]) => {
      const others = prev.filter((td:any) => td.term !== currentTerm);
      return [...others, ...tempTermData];
    });
    setHasChanges(false);
    alert('Progress saved successfully for ' + currentTerm);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {[Section.A, Section.B].map(s => (
            <button key={s} onClick={() => setSec(s)} className={`px-10 py-3 rounded-xl font-black transition-all ${sec === s ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Section {s}</button>
          ))}
        </div>
        <button 
          onClick={handleSave} 
          disabled={!hasChanges}
          className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all shadow-xl ${hasChanges ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
        >
          <Save size={20} /> Save All Progress
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-2xl overflow-hidden marks-table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead>
              <tr className="bg-[#0f172a] text-white text-[9px] font-black uppercase tracking-widest">
                <th className="p-6 sticky left-0 z-20 bg-[#0f172a] border-r border-slate-800">Student Identity</th>
                {subjects.map((sub:any) => (
                  <th key={sub.id} colSpan={2} className="p-4 text-center border-x border-slate-800 whitespace-nowrap">
                    {sub.name}
                    <div className="flex justify-center gap-6 mt-2 opacity-50"><span>TH ({sub.fullMarksTheory})</span><span>PR ({sub.fullMarksPractical})</span></div>
                  </th>
                ))}
                <th className="p-6 text-center border-l border-slate-800 whitespace-nowrap">Attendance (P / T)</th>
                <th className="p-6 text-center border-l border-slate-800 whitespace-nowrap">Conduct</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((st:any) => {
                const td = tempTermData.find((t:any) => t.studentId === st.id) || { attendancePresent: 0, attendanceTotal: 0, conduct: Conduct.GOOD };
                return (
                  <tr key={st.id} className="border-b border-slate-50 hover:bg-blue-50/30 group transition-colors">
                    <td className="p-6 font-black text-slate-800 sticky left-0 z-10 bg-white group-hover:bg-blue-50 border-r border-slate-100 min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-300 w-5 tabular-nums">{st.rollNo}</span>
                        <span className="truncate uppercase text-xs">{st.name}</span>
                      </div>
                    </td>
                    {subjects.map((sub:any) => {
                       const m = tempMarks.find((mk:any) => mk.studentId === st.id && mk.subjectId === sub.id) || { theoryObtained: 0, practicalObtained: 0 };
                       return (
                         <React.Fragment key={sub.id}>
                            <td className="p-3 border-x border-slate-50">
                              <input 
                                type="number" 
                                className={`w-14 p-2 bg-transparent border-b-2 outline-none text-center font-black tabular-nums transition-all ${m.theoryObtained < sub.passMarksTheory ? 'border-red-200 text-red-500' : 'border-slate-100 focus:border-blue-500'}`} 
                                value={m.theoryObtained} 
                                onChange={e => updateMark(st.id, sub.id, 'th', e.target.value, sub.fullMarksTheory)} 
                              />
                            </td>
                            <td className="p-3 border-x border-slate-50">
                              <input 
                                type="number" 
                                className={`w-14 p-2 bg-transparent border-b-2 outline-none text-center font-black tabular-nums transition-all ${m.practicalObtained < sub.passMarksPractical ? 'border-red-200 text-red-500' : 'border-slate-100 focus:border-blue-500'}`} 
                                value={m.practicalObtained} 
                                onChange={e => updateMark(st.id, sub.id, 'pr', e.target.value, sub.fullMarksPractical)} 
                              />
                            </td>
                         </React.Fragment>
                       );
                    })}
                    <td className="p-3 border-l border-slate-50">
                       <div className="flex items-center justify-center gap-2">
                         <input type="number" className="w-12 p-2 border-b-2 border-slate-100 text-center font-bold outline-none focus:border-blue-500" value={td.attendancePresent} onChange={e => updateTD(st.id, 'attendancePresent', parseInt(e.target.value) || 0)} />
                         <span className="text-slate-300 font-bold">/</span>
                         <input type="number" className="w-12 p-2 border-b-2 border-slate-100 text-center font-bold outline-none focus:border-blue-500" value={td.attendanceTotal} onChange={e => updateTD(st.id, 'attendanceTotal', parseInt(e.target.value) || 0)} />
                       </div>
                    </td>
                    <td className="p-3 border-l border-slate-50">
                      <select className="p-2 rounded-lg bg-slate-50 text-[10px] font-black uppercase border-none outline-none" value={td.conduct} onChange={e => updateTD(st.id, 'conduct', e.target.value as Conduct)}>
                        {Object.values(Conduct).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {hasChanges && (
        <div className="save-bar fixed bottom-8 right-8 z-50 animate-bounce">
           <button onClick={handleSave} className="bg-green-600 text-white px-10 py-5 rounded-full font-black shadow-2xl flex items-center gap-3 hover:bg-green-700">
             <Save size={24} /> UNSAVED CHANGES - CLICK TO SAVE
           </button>
        </div>
      )}
    </div>
  );
};

const Results = ({ reports, subjects, currentTerm }: any) => {
  const [selectedReport, setSelectedReport] = useState<StudentReport | null>(null);
  const [sec, setSec] = useState(Section.A);
  const filtered = reports.filter((r:any) => r.student.section === sec).sort((a:any, b:any) => parseInt(a.student.rollNo) - parseInt(b.student.rollNo));

  const printSingle = (rep: StudentReport) => {
    const el = document.getElementById('print-layer');
    if (el) {
      el.innerHTML = '';
      const div = document.createElement('div');
      div.className = 'marksheet-page';
      el.appendChild(div);
      
      import('react-dom/client').then(({ createRoot }) => {
        const root = createRoot(div);
        root.render(<GradeSheet report={rep} />);
        setTimeout(() => window.print(), 500);
      });
    }
  };

  const serialPrint = () => {
    const el = document.getElementById('print-layer');
    if (el) {
      el.innerHTML = '';
      filtered.forEach((rep: any) => {
        const div = document.createElement('div');
        div.className = 'marksheet-page';
        el.appendChild(div);
        import('react-dom/client').then(({ createRoot }) => {
          const root = createRoot(div);
          root.render(<GradeSheet report={rep} />);
        });
      });
      setTimeout(() => window.print(), 1000);
    }
  };

  const printLedger = () => {
    const el = document.getElementById('print-layer');
    if (el) {
      el.innerHTML = '';
      const div = document.createElement('div');
      div.className = 'ledger-page';
      el.appendChild(div);
      import('react-dom/client').then(({ createRoot }) => {
        const root = createRoot(div);
        root.render(<SectionLedger reports={filtered} subjects={subjects} currentTerm={currentTerm} section={sec} />);
        setTimeout(() => window.print(), 800);
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
           {[Section.A, Section.B].map(s => (
             <button key={s} onClick={() => setSec(s)} className={`px-10 py-3 rounded-xl font-black transition-all ${sec === s ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Sec {s}</button>
           ))}
        </div>
        <div className="flex gap-4">
           <button onClick={printLedger} className="bg-amber-50 text-amber-600 px-6 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-amber-600 hover:text-white transition-all text-[10px] uppercase tracking-widest border border-amber-200"><LayoutTemplate size={18} /> Section Ledger</button>
           <button onClick={serialPrint} className="bg-[#0f172a] text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-black shadow-xl active:scale-95 transition-all text-[10px] uppercase tracking-widest"><Printer size={18} /> Batch Print Marksheets</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((r:any) => (
          <div key={r.student.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all group relative overflow-hidden">
             <div className="flex justify-between items-start mb-6">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">{r.student.rollNo}</div>
                <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${r.hasNG ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-green-50 text-green-500 border border-green-100'}`}>
                   {r.hasNG ? 'Non-Graded' : 'Qualified'}
                </div>
             </div>
             <h4 className="text-lg font-black text-slate-800 tracking-tighter uppercase mb-1">{r.student.name}</h4>
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-8">GPA: {(r.hasNG ? 0.00 : r.gpa).toFixed(2)}</p>
             <div className="flex gap-2">
                <button onClick={() => setSelectedReport(r)} className="flex-1 py-3.5 bg-[#0f172a] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black shadow-lg">Detailed Preview</button>
                <button onClick={() => printSingle(r)} className="px-4 py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-md"><Printer size={18} /></button>
             </div>
          </div>
        ))}
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-4 print:hidden">
           <div className="absolute top-6 right-6 flex gap-3 z-[110]">
              <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black flex items-center gap-2 shadow-2xl hover:scale-105 transition-all text-xs uppercase"><Printer /> Print Now</button>
              <button onClick={() => setSelectedReport(null)} className="p-4 bg-white/10 text-white hover:bg-red-500 rounded-full transition-all"><X size={24} /></button>
           </div>
           <div className="w-full max-w-[210mm] max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] p-4 shadow-2xl">
              <div className="preview-scale flex justify-center py-6">
                 <GradeSheet report={selectedReport} />
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const ExpenseManager = ({ expenses, setExpenses }: any) => {
  const [show, setShow] = useState(false);
  const [f, setF] = useState({ desc: '', amt: '', cat: 'Stationery', date: new Date().toISOString().split('T')[0] });
  const add = (e:any) => {
    e.preventDefault();
    setExpenses([...expenses, { id: Date.now().toString(), description: f.desc, amount: parseFloat(f.amt), category: f.cat, date: f.date }]);
    setShow(false);
    setF({ desc: '', amt: '', cat: 'Stationery', date: new Date().toISOString().split('T')[0] });
  };
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black tracking-tighter text-slate-800">Operational Accounts</h3>
        <button onClick={() => setShow(!show)} className="bg-red-600 text-white px-8 py-4 rounded-xl font-black flex items-center gap-2 hover:bg-red-700 shadow-xl transition-all">
          {show ? <X /> : <Plus />} Record Expense
        </button>
      </div>
      {show && (
        <form onSubmit={add} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-2xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in zoom-in-95 duration-300">
           <InputField label="Expense Description" value={f.desc} onChange={(v:any) => setF({...f, desc: v})} required />
           <InputField label="Amount (NPR)" type="number" value={f.amt} onChange={(v:any) => setF({...f, amt: v})} required />
           <div>
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Category</label>
             <select className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 outline-none" value={f.cat} onChange={e => setF({...f, cat: e.target.value})}>
               <option>Stationery</option><option>Utilities</option><option>Maintenance</option><option>Sports</option><option>Events</option><option>Other</option>
             </select>
           </div>
           <InputField label="Transaction Date" type="date" value={f.date} onChange={(v:any) => setF({...f, date: v})} required />
           <button className="md:col-span-4 py-5 bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl">Confirm Entry</button>
        </form>
      )}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <th className="p-6">Date</th><th className="p-6">Description</th><th className="p-6">Category</th><th className="p-6 text-right">Amount</th><th className="p-6"></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((ex:any) => (
              <tr key={ex.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="p-6 font-bold text-slate-400 text-xs">{ex.date}</td>
                <td className="p-6 font-black text-slate-800 uppercase text-xs">{ex.description}</td>
                <td className="p-6"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[8px] font-black uppercase tracking-widest">{ex.category}</span></td>
                <td className="p-6 text-right font-black text-red-600 tabular-nums">Rs {ex.amount.toLocaleString()}</td>
                <td className="p-6 text-right"><button onClick={() => { if(confirm('Delete?')) setExpenses(expenses.filter((x:any) => x.id !== ex.id)) }} className="text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={16} /></button></td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr><td colSpan={5} className="p-20 text-center font-black text-slate-300 uppercase tracking-widest text-xs">No records found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UserManager = ({ users, setUsers, currentUserId }: any) => {
  const [show, setShow] = useState(false);
  const [f, setF] = useState({ name: '', user: '', pass: '', role: UserRole.TEACHER });
  const add = (e:any) => {
    e.preventDefault();
    setUsers([...users, { id: Date.now().toString(), name: f.name, username: f.user, password: f.pass, role: f.role }]);
    setShow(false);
    setF({ name: '', user: '', pass: '', role: UserRole.TEACHER });
  };
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
       <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black tracking-tighter">System Access</h3>
        <button onClick={() => setShow(!show)} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black flex items-center gap-2 hover:bg-black shadow-xl transition-all">
          {show ? <X /> : <Plus />} New Account
        </button>
      </div>
      {show && (
        <form onSubmit={add} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-300">
           <InputField label="Staff Full Name" value={f.name} onChange={(v:any) => setF({...f, name: v})} required />
           <InputField label="Login ID" value={f.user} onChange={(v:any) => setF({...f, user: v})} required />
           <InputField label="Secure Password" type="password" value={f.pass} onChange={(v:any) => setF({...f, pass: v})} required />
           <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 block">Role</label>
            <select className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none" value={f.role} onChange={e => setF({...f, role: e.target.value as UserRole})}>
              <option value={UserRole.TEACHER}>Class Teacher</option>
              <option value={UserRole.ADMIN}>Administrator</option>
            </select>
          </div>
           <button className="md:col-span-2 py-5 bg-[#0f172a] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl">Activate Account</button>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {users.map((u:any) => (
          <div key={u.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-500 transition-all">
             <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-xl flex items-center justify-center font-black text-lg group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner uppercase">{u.name.charAt(0)}</div>
                <div>
                   <h4 className="font-black text-slate-800 uppercase tracking-tight text-sm">{u.name}</h4>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">@{u.username} • {u.role}</p>
                </div>
             </div>
             {u.id !== currentUserId && <button onClick={() => { if(confirm('Remove user?')) setUsers(users.filter((x:any) => x.id !== u.id)) }} className="text-slate-100 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>}
          </div>
        ))}
      </div>
    </div>
  );
};

// Fixed: Added missing Login component
const Login = ({ onLogin }: any) => {
  const [form, setForm] = useState({ username: '', password: '' });
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 w-full">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-2xl">
        <div className="flex flex-col items-center mb-10">
          <div className="bg-blue-600 p-4 rounded-2xl mb-6 shadow-xl shadow-blue-500/20">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Kankali RMS</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 text-center">School Management Portal</p>
        </div>
        <form onSubmit={(e) => onLogin(e, form)} className="space-y-6">
          <InputField label="Username" value={form.username} onChange={(v: string) => setForm({ ...form, username: v })} required />
          <InputField label="Password" type="password" value={form.password} onChange={(v: string) => setForm({ ...form, password: v })} required />
          <button className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-blue-700 transition-all active:scale-95">
            Sign In to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
};

// --- GradeSheet Component (The physical layout for printing) ---

const GradeSheet = ({ report }: { report: StudentReport }) => (
  <div className="marksheet-page-content relative">
     <div className="flex items-center gap-10 mb-10 pb-8 border-b-4 border-slate-900">
        <div className="w-28 h-28 border-4 border-slate-900 rounded-[2rem] flex flex-col items-center justify-center font-black text-[9px] p-2 text-center leading-tight uppercase shadow-2xl bg-slate-50">
           <div className="w-10 h-10 bg-slate-900 rounded-xl mb-2 flex items-center justify-center"><GraduationCap className="w-6 h-6 text-white" /></div>
           KANKALI LOGO
        </div>
        <div className="flex-1 text-center">
           <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900 mb-1">Shree Kankali Secondary School</h1>
           <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Chandragiri-13, Kathmandu, Bagmati Province, Nepal</p>
           <div className="flex items-center gap-6 mb-4">
              <div className="h-0.5 flex-1 bg-slate-900"></div>
              <h2 className="text-xl font-black tracking-[0.6em] text-slate-900 uppercase">Grade Sheet</h2>
              <div className="h-0.5 flex-1 bg-slate-900"></div>
           </div>
           <p className="text-xs font-black italic text-blue-600 uppercase tracking-widest">{report.term} Assessment 2082</p>
        </div>
     </div>

     <div className="grid grid-cols-4 gap-6 mb-8 p-8 border-2 border-slate-900 rounded-[2rem] bg-slate-50/50">
        <div className="col-span-2">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Name</p>
           <p className="text-xl font-black text-slate-900 uppercase underline decoration-2 decoration-blue-200 underline-offset-8">{report.student.name}</p>
        </div>
        <div className="text-center">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Class / Section</p>
           <p className="text-xl font-black text-slate-900">6 "{report.student.section}"</p>
        </div>
        <div className="text-right">
           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Roll Number</p>
           <p className="text-xl font-black text-slate-900 tabular-nums">{report.student.rollNo}</p>
        </div>
     </div>

     <table className="w-full border-collapse border-2 border-slate-900 text-[11px] mb-8">
        <thead>
           <tr className="bg-slate-900 text-white">
              <th className="border border-slate-800 p-3 text-left w-14 uppercase font-black">Code</th>
              <th className="border border-slate-800 p-3 text-left uppercase font-black">Subject</th>
              <th className="border border-slate-800 p-3 text-center w-16 uppercase font-black">Credit</th>
              <th className="border border-slate-800 p-3 text-center w-16 uppercase font-black">Obt.Grade</th>
              <th className="border border-slate-800 p-3 text-center w-16 uppercase font-black">GradePoint</th>
              <th className="border border-slate-800 p-3 text-center w-20 uppercase font-black bg-slate-700">Final Grade</th>
              <th className="border border-slate-800 p-3 text-left w-20 uppercase font-black">Remarks</th>
           </tr>
        </thead>
        <tbody>
           {report.results.map((res:any) => (
              <React.Fragment key={res.subjectCode}>
                 <tr className="border-t border-slate-900">
                    <td className="border border-slate-900 p-2 text-center font-black text-slate-400" rowSpan={2}>{res.subjectCode}</td>
                    <td className="border border-slate-900 px-4 py-2 font-black uppercase text-slate-800">{res.subjectName} (TH)</td>
                    <td className="border border-slate-900 p-2 text-center font-black bg-slate-50" rowSpan={2}>{res.creditHour.toFixed(2)}</td>
                    <td className={`border border-slate-900 p-2 text-center font-black ${res.theoryGrade === 'NG' ? 'text-red-600' : ''}`}>{res.theoryGrade}</td>
                    <td className="border border-slate-900 p-2 text-center font-black tabular-nums">{res.theoryGP.toFixed(1)}</td>
                    <td className="border-l-4 border-slate-900 p-2 text-center font-black bg-slate-50 text-base" rowSpan={2}>
                      <span className={res.isNG ? 'text-red-600' : 'text-slate-900'}>{res.finalGrade}</span>
                    </td>
                    <td className="border border-slate-900 p-2" rowSpan={2}></td>
                 </tr>
                 <tr>
                    <td className="border border-slate-900 px-4 py-2 font-black uppercase text-slate-800">{res.subjectName} (PR)</td>
                    <td className={`border border-slate-900 p-2 text-center font-black ${res.practicalGrade === 'NG' ? 'text-red-600' : ''}`}>{res.practicalGrade}</td>
                    <td className="border border-slate-900 p-2 text-center font-black tabular-nums">{res.practicalGP.toFixed(1)}</td>
                 </tr>
              </React.Fragment>
           ))}
           <tr className="bg-slate-900 text-white font-black border-t-2 border-slate-900">
              <td colSpan={2} className="p-4 text-right uppercase tracking-widest text-[9px]">Total Credit Hours</td>
              <td className="p-4 text-center bg-slate-800 text-lg">{report.results.reduce((acc:any, curr:any) => acc + curr.creditHour, 0).toFixed(2)}</td>
              <td colSpan={2} className="p-4 text-right uppercase tracking-widest text-[9px]">Grade Point Average (GPA)</td>
              <td className="p-4 text-center text-2xl font-black bg-white text-slate-900 tabular-nums border-4 border-slate-900">
                {(report.hasNG ? 0.00 : report.gpa).toFixed(2)}
              </td>
              <td className="p-4"></td>
           </tr>
        </tbody>
     </table>

     <div className="flex gap-16 mb-20 px-4">
        <div className="flex flex-col gap-3">
           <span className="font-black text-[9px] uppercase tracking-widest text-slate-400">Attendance</span>
           <div className="border-2 border-slate-900 min-w-[120px] rounded-2xl overflow-hidden shadow-lg bg-white">
              <div className="border-b-2 border-slate-900 p-4 text-center font-black text-3xl tabular-nums">{report.attendancePresent}</div>
              <div className="p-2 text-center font-black text-[8px] text-slate-400 uppercase tracking-widest bg-slate-50">{report.attendanceTotal} Total Days</div>
           </div>
        </div>
        <div className="flex-1 flex flex-col gap-3">
           <span className="font-black text-[9px] uppercase tracking-widest text-slate-400">Student Conduct Evaluation</span>
           <div className="border-2 border-slate-900 max-w-[320px] rounded-2xl overflow-hidden shadow-lg bg-white">
              {[Conduct.EXCELLENT, Conduct.GOOD, Conduct.SATISFACTORY].map((c, i) => (
                 <div key={c} className={`p-4 text-[9px] flex justify-between px-6 font-black uppercase tracking-widest ${i < 2 ? 'border-b border-slate-100' : ''} ${report.conduct === c ? 'bg-slate-900 text-white' : 'text-slate-200'}`}>
                    {c} {report.conduct === c && '✓'}
                 </div>
              ))}
           </div>
        </div>
     </div>

     <div className="flex justify-between mt-32 px-12 pb-16">
        <div className="text-center w-60 border-t-2 border-slate-900 pt-4">
           <p className="font-black uppercase text-[9px] tracking-[0.4em] text-slate-900">Class Teacher</p>
        </div>
        <div className="text-center w-60 border-t-2 border-slate-900 pt-4">
           <p className="font-black uppercase text-[9px] tracking-[0.4em] text-slate-900">Principal</p>
        </div>
     </div>

     <div className="absolute bottom-6 left-10 right-10 flex justify-between items-center text-[8px] font-black text-slate-300 uppercase tracking-[0.6em] italic">
        <span>Date: 2082/05/21</span>
        <span>KANKALI RMS v4.5 DIGITAL PRO</span>
     </div>
  </div>
);

const SectionLedger = ({ reports, subjects, currentTerm, section }: any) => (
  <div className="bg-white min-h-full">
     <div className="p-8 text-center border-b-2 border-slate-900 bg-slate-50">
        <h1 className="text-2xl font-black uppercase tracking-tighter">Shree Kankali Secondary School</h1>
        <p className="text-sm font-bold text-slate-500 uppercase tracking-[0.4em] mt-1">Section Ledger • {currentTerm} • Section {section}</p>
     </div>
     <table className="w-full text-left border-collapse text-[9px]">
        <thead className="bg-slate-900 text-white">
          <tr className="border-b border-slate-900">
             <th className="p-3 border-r border-slate-700 uppercase font-black">Roll</th>
             <th className="p-3 border-r border-slate-700 uppercase font-black min-w-[150px]">Student Name</th>
             {subjects.map((s:any) => (
               <th key={s.id} className="p-3 text-center border-x border-slate-700 font-black uppercase whitespace-nowrap">{s.name}</th>
             ))}
             <th className="p-3 text-center border-l-2 border-slate-900 font-black bg-slate-800 uppercase">GPA</th>
          </tr>
        </thead>
        <tbody>
           {reports.map((r:any) => (
             <tr key={r.student.id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="p-3 border-r border-slate-300 font-bold text-center tabular-nums">{r.student.rollNo}</td>
                <td className="p-3 border-r border-slate-300 font-black uppercase text-[10px]">{r.student.name}</td>
                {r.results.map((res:any) => (
                  <td key={res.subjectCode} className={`p-3 text-center border-x border-slate-100 font-bold ${res.isNG ? 'text-red-500' : 'text-slate-700'}`}>{res.finalGrade}</td>
                ))}
                <td className="p-3 text-center border-l-2 border-slate-900 font-black text-[12px] tabular-nums">{(r.hasNG ? 0.00 : r.gpa).toFixed(2)}</td>
             </tr>
           ))}
        </tbody>
     </table>
     <div className="p-8 flex justify-between text-[8px] font-black text-slate-300 italic uppercase tracking-[0.5em]">
       <span>Printed: {new Date().toLocaleDateString()}</span>
       <span>KANKALI RMS PRO v4.5</span>
     </div>
  </div>
);

const InputField = ({ label, ...props }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">{label}</label>
    <input className="w-full p-4 bg-slate-50 rounded-2xl font-bold border-2 border-slate-100 outline-none focus:border-blue-500 transition-all text-slate-800 text-sm" {...props} onChange={e => props.onChange(e.target.value)} />
  </div>
);

const ShieldCheck = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
);

export default App;
