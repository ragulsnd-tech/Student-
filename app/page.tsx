"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Student = {
  id: string;
  name: string;
  email: string;
  course: string;
  year: string;
  status: "Active" | "Inactive";
  attendance: "Present" | "Absent";
  marks: number;
};

const starterStudents: Student[] = [
  { id: "STU1001", name: "Aarav Kumar", email: "aarav@example.com", course: "Computer Science", year: "1st Year", status: "Active", attendance: "Present", marks: 86 },
  { id: "STU1002", name: "Diya Sharma", email: "diya@example.com", course: "Information Technology", year: "2nd Year", status: "Active", attendance: "Present", marks: 92 },
  { id: "STU1003", name: "Arjun Raj", email: "arjun@example.com", course: "Computer Science", year: "1st Year", status: "Active", attendance: "Absent", marks: 74 },
  { id: "STU1004", name: "Meera Patel", email: "meera@example.com", course: "Electronics", year: "3rd Year", status: "Inactive", attendance: "Present", marks: 81 },
];

type Page = "Overview" | "Students" | "Attendance" | "Marks";

export default function Home() {
  const [students, setStudents] = useState<Student[]>(starterStudents);
  const [page, setPage] = useState<Page>("Overview");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", course: "Computer Science", year: "1st Year" });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("campusdesk-students");
      if (saved) setStudents(JSON.parse(saved) as Student[]);
    } catch { /* Use sample data if local storage is unavailable. */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("campusdesk-students", JSON.stringify(students));
  }, [students, hydrated]);

  const filtered = useMemo(() => students.filter((s) =>
    [s.name, s.email, s.id, s.course].some((v) => v.toLowerCase().includes(search.toLowerCase()))
  ), [students, search]);

  const presentCount = students.filter((s) => s.attendance === "Present").length;
  const average = students.length ? Math.round(students.reduce((sum, s) => sum + s.marks, 0) / students.length) : 0;

  function addStudent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const newStudent: Student = {
      id: `STU${Date.now().toString().slice(-6)}`,
      ...form,
      status: "Active",
      attendance: "Present",
      marks: 0,
    };
    setStudents((old) => [newStudent, ...old]);
    setForm({ name: "", email: "", course: "Computer Science", year: "1st Year" });
    setShowForm(false);
    setPage("Students");
  }

  function updateAttendance(id: string) {
    setStudents((old) => old.map((s) => s.id === id
      ? { ...s, attendance: s.attendance === "Present" ? "Absent" : "Present" }
      : s));
  }

  function updateMarks(id: string, value: string) {
    const marks = Math.max(0, Math.min(100, Number(value) || 0));
    setStudents((old) => old.map((s) => s.id === id ? { ...s, marks } : s));
  }

  function deleteStudent(id: string) {
    if (window.confirm("Delete this student record?")) setStudents((old) => old.filter((s) => s.id !== id));
  }

  const nav: { label: Page; icon: string }[] = [
    { label: "Overview", icon: "▦" },
    { label: "Students", icon: "♙" },
    { label: "Attendance", icon: "✓" },
    { label: "Marks", icon: "▤" },
  ];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">C</span> CampusDesk</div>
        <div>
          <div className="nav-label">MENU</div>
          {nav.map((item) => (
            <button key={item.label} className={`nav-item ${page === item.label ? "active" : ""}`} onClick={() => setPage(item.label)}>
              <span>{item.icon}</span>{item.label}
            </button>
          ))}
        </div>
        <div className="side-note"><strong>Welcome to CampusDesk</strong><br />Manage student records, attendance and marks in one simple place.</div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <button className="secondary mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">☰</button>
            <p className="eyebrow">Campus administration / {page}</p>
            <h1>{page === "Overview" ? "Dashboard overview" : page}</h1>
          </div>
          <div className="top-right"><span className="admin-label" style={{fontSize:13,color:"#69748a"}}>Administrator</span><div className="avatar">A</div></div>
        </header>

        {menuOpen && <div className="panel" style={{marginBottom:16,display:"flex",gap:8,flexWrap:"wrap"}}>
          {nav.map((item) => <button key={item.label} className="secondary" onClick={() => {setPage(item.label);setMenuOpen(false);}}>{item.label}</button>)}
        </div>}

        {page === "Overview" && <>
          <section className="stats">
            <Stat title="Total students" value={students.length.toString()} icon="♙" note="Registered records" />
            <Stat title="Present today" value={presentCount.toString()} icon="✓" note="Based on saved attendance" />
            <Stat title="Absent today" value={(students.length - presentCount).toString()} icon="◷" note="Based on saved attendance" />
            <Stat title="Average marks" value={`${average}%`} icon="▤" note="Across all students" />
          </section>
          <section className="content-grid">
            <div className="panel">
              <div className="panel-head"><div><h2>Recent students</h2><span className="muted">Your latest student records</span></div><button className="primary" onClick={() => setShowForm(true)}>+ Add student</button></div>
              <StudentTable students={students.slice(0, 5)} onAttendance={updateAttendance} onDelete={deleteStudent} showAttendance={false} />
              <button className="secondary" style={{marginTop:14}} onClick={() => setPage("Students")}>View all students →</button>
            </div>
            <div className="panel">
              <div className="panel-head"><div><h2>Quick activity</h2><span className="muted">Current summary</span></div></div>
              <div className="activity"><i className="activity-dot" /><div><strong>{students.length} student records</strong><span>Currently stored in this browser</span></div></div>
              <div className="activity"><i className="activity-dot" /><div><strong>{presentCount} marked present</strong><span>Attendance summary</span></div></div>
              <div className="activity"><i className="activity-dot" /><div><strong>{average}% average marks</strong><span>Current class average</span></div></div>
              <p className="muted" style={{lineHeight:1.6,marginTop:15}}>Tip: Use the Students page to add records, Attendance to mark presence, and Marks to update scores.</p>
            </div>
          </section>
        </>}

        {page === "Students" && <section className="panel">
          <div className="panel-head"><div><h2>All students</h2><span className="muted">{students.length} student records</span></div><button className="primary" onClick={() => setShowForm(true)}>+ Add student</button></div>
          <input className="search" placeholder="Search by name, email, ID or course..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <div style={{marginTop:15}}><StudentTable students={filtered} onAttendance={updateAttendance} onDelete={deleteStudent} /></div>
        </section>}

        
{page === "Attendance" && (
  <section className="panel">
    <div className="panel-head">
      <div>
        <h2>Attendance register</h2>
        <span className="muted">
          Select the status to toggle Present / Absent
        </span>
      </div>
    </div>
    <StudentTable
      students={filtered}
      onAttendance={updateAttendance}
      onDelete={deleteStudent}
      showAttendance
    />
  </section>
)}
        

        {page === "Marks" && <section className="panel">
          <div className="panel-head"><div><h2>Examination marks</h2><span className="muted">Enter a score between 0 and 100</span></div></div>
          <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>COURSE</th><th>MARKS / 100</th><th>GRADE</th></tr></thead>
            <tbody>{filtered.map((s) => <tr key={s.id}><td><div className="student-name">{s.name}</div><div className="student-email">{s.id}</div></td><td>{s.course}</td><td><input aria-label={`Marks for ${s.name}`} type="number" min="0" max="100" className="field" style={{width:90,padding:7}} value={s.marks} onChange={(e) => updateMarks(s.id,e.target.value)} /></td><td><span className="pill">{s.marks >= 90 ? "A+" : s.marks >= 80 ? "A" : s.marks >= 70 ? "B" : s.marks >= 50 ? "C" : "Needs review"}</span></td></tr>)}</tbody>
          </table>{filtered.length === 0 && <div className="empty">No students found.</div>}</div>
        </section>}
        <p className="muted" style={{textAlign:"center",marginTop:24}}>CampusDesk • Beginner project • Data is saved in this browser</p>
      </main>

      {showForm && <div className="modal-backdrop" role="presentation" onMouseDown={(e) => {if(e.target === e.currentTarget) setShowForm(false);}}>
        <form className="modal" onSubmit={addStudent}>
          <div className="panel-head"><div><h2>Add a student</h2><span className="muted">Enter the student's details</span></div><button type="button" className="secondary" onClick={() => setShowForm(false)}>✕</button></div>
          <div className="form-grid">
            <Field label="Full name"><input className="field" required minLength={2} placeholder="Student name" value={form.name} onChange={(e) => setForm({...form,name:e.target.value})} /></Field>
            <Field label="Email address"><input className="field" required type="email" placeholder="name@example.com" value={form.email} onChange={(e) => setForm({...form,email:e.target.value})} /></Field>
            <Field label="Course"><select className="field" value={form.course} onChange={(e) => setForm({...form,course:e.target.value})}><option>Computer Science</option><option>Information Technology</option><option>Electronics</option><option>Mechanical Engineering</option><option>Business Administration</option></select></Field>
            <Field label="Year"><select className="field" value={form.year} onChange={(e) => setForm({...form,year:e.target.value})}><option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option></select></Field>
          </div>
          <div className="modal-actions"><button type="button" className="secondary" onClick={() => setShowForm(false)}>Cancel</button><button className="primary" type="submit">Save student</button></div>
        </form>
      </div>}
    </div>
  );
}

function Stat({title,value,icon,note}:{title:string;value:string;icon:string;note:string}) {
  return <div className="panel"><div className="stat-top"><span>{title}</span><span className="stat-icon">{icon}</span></div><div className="stat-number">{value}</div><div className="stat-sub">{note}</div></div>;
}

function Field({label,children}:{label:string;children:React.ReactNode}) {
  return <div className="field-group"><label>{label}</label>{children}</div>;
}

function StudentTable({students,onAttendance,onDelete,showAttendance=true}:{students:Student[];onAttendance:(id:string)=>void;onDelete:(id:string)=>void;showAttendance?:boolean}) {
  return <div className="table-wrap"><table><thead><tr><th>STUDENT</th><th>COURSE</th><th>YEAR</th>{showAttendance && <th>ATTENDANCE</th>}<th>ACTION</th></tr></thead>
    <tbody>{students.map((s) => <tr key={s.id}><td><div className="student-name">{s.name}</div><div className="student-email">{s.email} · {s.id}</div></td><td>{s.course}</td><td>{s.year}</td>{showAttendance && <td><button className={`pill ${s.attendance === "Absent" ? "absent" : ""}`} onClick={() => onAttendance(s.id)}>{s.attendance}</button></td>}<td><button className="danger" onClick={() => onDelete(s.id)}>Delete</button></td></tr>)}</tbody>
  </table>{students.length === 0 && <div className="empty">No students found. Add a student to get started.</div>}</div>;
}
