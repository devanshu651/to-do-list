import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowDownUp, ArrowRight, Bell, CalendarDays, Check, CheckCheck, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, LayoutDashboard, ListTodo, LogOut, Menu, MoreHorizontal, Plus, Search, Settings2, SlidersHorizontal, Sparkles, Trash2, X } from 'lucide-react';

const seedTasks = [
  { _id: '1', title: 'Finalize Q4 campaign strategy', description: 'Bring together the launch narrative, channel plan, and success metrics.', status: 'In Progress', priority: 'High', dueDate: '2026-10-30', category: 'Work', createdAt: '2026-10-24' },
  { _id: '2', title: 'Review design system updates', description: 'Check the latest component library changes and leave feedback for the team.', status: 'Pending', priority: 'Medium', dueDate: '2026-10-31', category: 'Work', createdAt: '2026-10-24' },
  { _id: '3', title: 'Book dentist appointment', description: 'Call the clinic and confirm a time for next week.', status: 'Pending', priority: 'Low', dueDate: '2026-11-02', category: 'Personal', createdAt: '2026-10-23' },
  { _id: '4', title: 'Prepare Monday team sync', description: 'Draft agenda and gather the latest project notes.', status: 'Completed', priority: 'Medium', dueDate: '2026-10-27', category: 'Work', createdAt: '2026-10-22' },
  { _id: '5', title: 'Read 20 pages', description: 'Make a little time for a good book tonight.', status: 'Completed', priority: 'Low', dueDate: '2026-10-28', category: 'Personal', createdAt: '2026-10-21' },
  { _id: '6', title: 'Share project brief with Maya', description: 'Send over the scope, milestones, and first round of references.', status: 'In Progress', priority: 'High', dueDate: '2026-10-30', category: 'Work', createdAt: '2026-10-20' },
];
const statusOptions = ['Pending', 'In Progress', 'Completed'];
const categories = ['All tasks', 'Work', 'Personal'];
const dateLabel = (date) => date ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(`${String(date).slice(0, 10)}T12:00:00`)) : 'No date';
const localDateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const apiRequest = async (path, options = {}) => {
  const token = localStorage.getItem('taskflow-token');
  const response = await fetch(`/api${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error?.message || 'Could not complete the request');
  return result;
};
const fetchAllTasks = async () => {
  let page = 1;
  let pages = 1;
  const tasks = [];
  do {
    const result = await apiRequest(`/tasks?page=${page}&limit=100`);
    tasks.push(...result.data);
    pages = result.meta.pages;
    page += 1;
  } while (page <= pages);
  return tasks;
};

function App() {
  const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('taskflow-tasks') || 'null') || seedTasks);
  const [filter, setFilter] = useState('All tasks');
  const [status, setStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('dueDate');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [menu, setMenu] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState('');
  const [apiOnline, setApiOnline] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [account, setAccount] = useState(() => JSON.parse(localStorage.getItem('taskflow-account') || 'null'));
  const [form, setForm] = useState({ title: '', description: '', status: 'Pending', priority: 'Medium', dueDate: '', category: 'Work' });
  const pageSize = 5;

  useEffect(() => { localStorage.setItem('taskflow-tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => {
    const checkHealth = () => fetch('/api/health').then(r => setApiOnline(r.ok)).catch(() => setApiOnline(false));
    checkHealth();
    const healthTimer = setInterval(checkHealth, 15000);
    if (localStorage.getItem('taskflow-token')) apiRequest('/auth/me').then(async ({ data }) => { localStorage.setItem('taskflow-account', JSON.stringify(data.user)); setAccount(data.user); setTasks(await fetchAllTasks()); setApiOnline(true); }).catch(() => { setApiOnline(false); setToast('Could not sync with the API. Your saved tasks were not changed.'); });
    return () => clearInterval(healthTimer);
  }, []);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 2600); return () => clearTimeout(timer); }, [toast]);

  const filtered = useMemo(() => tasks.filter(t => (filter === 'All tasks' || t.category === filter) && (status === 'All' || t.status === status) && `${t.title} ${t.description} ${t.category}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === 'priority' ? ['High', 'Medium', 'Low'].indexOf(a.priority) - ['High', 'Medium', 'Low'].indexOf(b.priority) : sort === 'createdAt' ? new Date(b.createdAt) - new Date(a.createdAt) : (a.dueDate || '9999').localeCompare(b.dueDate || '9999')), [tasks, filter, status, search, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visibleTasks = filtered.slice((page - 1) * pageSize, page * pageSize);
  const count = (key) => tasks.filter(t => key === 'All tasks' ? true : t.status === key).length;
  const done = tasks.filter(t => t.status === 'Completed').length;
  const progress = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const today = localDateKey();
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const displayName = account?.name?.split(' ')[0] || 'Jordan';
  const todayLabel = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  const openCreate = () => { setEditing(null); setForm({ title: '', description: '', status: 'Pending', priority: 'Medium', dueDate: '', category: filter === 'All tasks' ? 'Work' : filter }); setModal(true); };
  const openEdit = (task) => { setEditing(task); setForm({ ...task, dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : '' }); setModal(true); };
  const saveTask = async (event) => {
    event.preventDefault();
    if (!form.title.trim()) return;
    const payload = { ...form, title: form.title.trim(), dueDate: form.dueDate || null };
    try {
      if (localStorage.getItem('taskflow-token')) {
        const { data } = await apiRequest(editing ? `/tasks/${editing._id}` : '/tasks', { method: editing ? 'PATCH' : 'POST', body: JSON.stringify(payload) });
        setTasks(list => editing ? list.map(t => t._id === editing._id ? data : t) : [data, ...list]);
      } else if (editing) setTasks(list => list.map(t => t._id === editing._id ? { ...t, ...payload } : t));
      else setTasks(list => [{ ...payload, _id: crypto.randomUUID(), createdAt: new Date().toISOString().slice(0, 10) }, ...list]);
      setModal(false); setToast(editing ? 'Task updated' : 'Task added to your list');
    } catch (error) { setToast(error.message); }
  };
  const updateStatus = async (task) => { const next = statusOptions[(statusOptions.indexOf(task.status) + 1) % statusOptions.length]; try { if (localStorage.getItem('taskflow-token')) { const { data } = await apiRequest(`/tasks/${task._id}`, { method: 'PATCH', body: JSON.stringify({ status: next }) }); setTasks(list => list.map(t => t._id === task._id ? data : t)); } else setTasks(list => list.map(t => t._id === task._id ? { ...t, status: next } : t)); setToast(`Moved to ${next.toLowerCase()}`); } catch (error) { setToast(error.message); } };
  const deleteTask = async (id) => { try { if (localStorage.getItem('taskflow-token')) await apiRequest(`/tasks/${id}`, { method: 'DELETE' }); setTasks(list => list.filter(t => t._id !== id)); setToast('Task deleted'); setMenu(false); } catch (error) { setToast(error.message); } };
  const authenticate = async (event) => { event.preventDefault(); let issuedToken = false; try { const { data } = await apiRequest(`/auth/${authMode === 'register' ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify(authForm) }); localStorage.setItem('taskflow-token', data.token); issuedToken = true; const tasks = await fetchAllTasks(); localStorage.setItem('taskflow-account', JSON.stringify(data.user)); setAccount(data.user); setTasks(tasks); setApiOnline(true); setAuthModal(false); setToast(authMode === 'register' ? 'Your account is ready' : 'Welcome back'); } catch (error) { if (issuedToken) localStorage.removeItem('taskflow-token'); setToast(error.message); } };
  const signOut = () => { localStorage.removeItem('taskflow-token'); localStorage.removeItem('taskflow-account'); setAccount(null); setTasks(seedTasks); setToast('Signed out'); setMenu(false); };
  const chooseFilter = (value) => { setFilter(value); setPage(1); };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-icon"><CheckCheck size={18} strokeWidth={2.4} /></div><span>taskflow</span><button className="mobile-close icon-button" onClick={() => setMobileNav(false)} aria-label="Close menu"><X size={18} /></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <button className="workspace-switch"><div className="workspace-avatar">S</div><span><strong>Studio North</strong><small>Free plan</small></span><ChevronDown size={15} /></button>
      <div className="nav-label">MENU</div>
      <nav className="main-nav">
        <button className="nav-item active"><LayoutDashboard size={17} /><span>Overview</span></button>
        <button className="nav-item" onClick={() => chooseFilter('All tasks')}><ListTodo size={17} /><span>My tasks</span><span className="nav-count">{tasks.length}</span></button>
        <button className="nav-item" onClick={() => { setStatus('In Progress'); setPage(1); }}><Activity size={17} /><span>In progress</span><span className="nav-count">{count('In Progress')}</span></button>
        <button className="nav-item" onClick={() => { setStatus('Completed'); setPage(1); }}><Check size={17} /><span>Completed</span></button>
      </nav>
      <div className="nav-label project-label">PROJECTS <button className="tiny-add" onClick={openCreate}><Plus size={14}/></button></div>
      <nav className="project-nav"><button className={`project-item ${filter === 'Work' ? 'selected' : ''}`} onClick={() => chooseFilter(filter === 'Work' ? 'All tasks' : 'Work')}><span className="project-dot blue"/>Work<span className="project-num">{tasks.filter(t => t.category === 'Work').length}</span></button><button className={`project-item ${filter === 'Personal' ? 'selected' : ''}`} onClick={() => chooseFilter(filter === 'Personal' ? 'All tasks' : 'Personal')}><span className="project-dot peach"/>Personal<span className="project-num">{tasks.filter(t => t.category === 'Personal').length}</span></button></nav>
      <div className="sidebar-bottom"><div className="upgrade-card"><div className="upgrade-spark"><Sparkles size={16} /></div><strong>A little more room?</strong><p>Unlock unlimited projects and more.</p><button onClick={() => setToast('You’re already on top of it!')}>Explore plans <ArrowRight size={13}/></button></div><button className="nav-item settings-link" onClick={() => setToast('Settings are coming soon')}><Settings2 size={17}/><span>Settings</span></button><div className="profile"><div className="profile-avatar">{account?.name ? account.name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase() : 'JD'}</div><div className="profile-copy"><strong>{account?.name || 'Jordan Davis'}</strong><small>{account?.email || 'jordan@studio.co'}</small></div>{account ? <button className="profile-action" onClick={signOut} title="Sign out" aria-label="Sign out"><LogOut size={15}/></button> : <button className="profile-action" onClick={() => setAuthModal(true)} title="Sign in" aria-label="Sign in"><ArrowRight size={15}/></button>}</div></div>
    </aside>
    {mobileNav && <button className="nav-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation"/>}
    <main className="main-area">
      <header className="topbar"><button className="mobile-menu icon-button" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu size={20}/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/> <span>Overview</span></div><div className="topbar-actions"><button className={`connection-pill ${account && apiOnline ? 'online' : ''}`} onClick={() => account ? setToast(apiOnline ? 'Your tasks are connected to your MongoDB account' : 'Sync is unavailable. Task changes will not be saved until the API reconnects.') : apiOnline ? setAuthModal(true) : setToast('Tasks are saved in this browser. Start the API to connect a MongoDB account.')}><span/> {account ? apiOnline ? 'MongoDB synced' : 'Sync unavailable' : apiOnline ? 'Local demo' : 'Local mode'}</button><button className="top-icon icon-button" aria-label="Help" onClick={() => setToast('Need a hand? hello@taskflow.app')}><CircleHelp size={18}/></button><button className="top-icon icon-button notification" aria-label="Notifications" onClick={() => setToast('You’re all caught up')}><Bell size={18}/><i/></button><div className="top-avatar">{account?.name ? account.name.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase() : 'JD'}</div></div></header>
      <div className="content-wrap">
        <section className="welcome-row"><div><div className="eyebrow"><span className="eyebrow-dot"/> {todayLabel.toUpperCase()}</div><h1>{greeting}, {displayName} <span className="wave">✳</span></h1><p className="welcome-subtitle">A clear mind starts with a clear plan.</p></div><button className="primary-button" onClick={openCreate}><Plus size={17}/> New task <kbd>N</kbd></button></section>
        <section className="overview-grid"><div className="focus-card"><div className="focus-top"><div><span className="focus-label">YOUR FOCUS</span><h2>Small steps, big momentum.</h2><p>You’re building a good rhythm. Keep it going.</p></div><div className="focus-art"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-core"><Sparkles size={20}/></div><span className="art-star star-a">✦</span><span className="art-star star-b">✧</span><span className="art-star star-c">·</span></div></div><div className="focus-divider"/><div className="focus-bottom"><div className="progress-copy"><strong>{progress}%</strong><span>of your tasks completed</span></div><div className="progress-track"><div style={{ width: `${progress}%` }}/></div><span className="focus-count">{done} of {tasks.length}</span></div></div>
          <div className="stat-card"><div className="stat-head"><span>Due today</span><span className="stat-icon coral"><CalendarDays size={17}/></span></div><strong className="stat-number">{tasks.filter(t => t.dueDate && String(t.dueDate).slice(0, 10) === today && t.status !== 'Completed').length || '—'}</strong><div className="stat-note"><span className="note-dot coral-dot"/> Keep your day in view</div><div className="stat-sparkline coral-line"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div>
          <div className="stat-card"><div className="stat-head"><span>In progress</span><span className="stat-icon violet"><Activity size={17}/></span></div><strong className="stat-number">{count('In Progress')}</strong><div className="stat-note"><span className="note-dot violet-dot"/> One thing at a time</div><div className="stat-sparkline violet-line"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div></section>
        <section className="task-section"><div className="section-heading"><div><div className="section-title-row"><h2>Your tasks</h2><span className="task-total">{filtered.length}</span></div><p>Keep the important things moving.</p></div><button className="text-button" onClick={() => { setStatus('All'); chooseFilter('All tasks'); }}>View all <ArrowRight size={15}/></button></div>
          <div className="task-toolbar"><div className="filter-tabs">{['All tasks', 'Pending', 'In Progress', 'Completed'].map(tab => <button key={tab} className={status === (tab === 'All tasks' ? 'All' : tab) ? 'tab-active' : ''} onClick={() => { setStatus(tab === 'All tasks' ? 'All' : tab); setPage(1); }}>{tab}<span>{tab === 'All tasks' ? tasks.length : count(tab)}</span></button>)}</div><div className="toolbar-tools"><label className="search-box"><Search size={15}/><input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search tasks"/><kbd>⌘ K</kbd></label><button className="tool-button" onClick={() => setSort(sort === 'priority' ? 'dueDate' : 'priority')} title="Toggle sort"><ArrowDownUp size={15}/><span>Sort</span></button><button className="tool-button filter-tool" onClick={() => setToast('Use the tabs to filter by status')}><SlidersHorizontal size={15}/><span>Filter</span></button></div></div>
          <div className="task-list">{visibleTasks.length ? visibleTasks.map(task => <article className="task-row" key={task._id}><button className={`task-check ${task.status === 'Completed' ? 'checked' : ''}`} onClick={() => updateStatus(task)} aria-label={`Move ${task.title} to next status`}>{task.status === 'Completed' ? <Check size={13}/> : null}</button><div className="task-main" onClick={() => openEdit(task)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && openEdit(task)}><div className="task-name-row"><h3 className={task.status === 'Completed' ? 'task-done' : ''}>{task.title}</h3>{task.priority === 'High' && <span className="priority-dot" title="High priority"/>}</div><p>{task.description || 'No description added.'}</p></div><span className={`category-chip ${task.category.toLowerCase()}`}><span/> {task.category}</span><span className={`status-chip ${task.status.toLowerCase().replace(' ', '-')}`}><span/> {task.status}</span><span className={`due-date ${task.dueDate && String(task.dueDate).slice(0, 10) < today && task.status !== 'Completed' ? 'overdue' : ''}`}><CalendarDays size={14}/>{dateLabel(task.dueDate)}</span><div className="row-menu-wrap"><button className="row-menu icon-button" aria-label="Task actions" onClick={() => setMenu(menu === task._id ? false : task._id)}><MoreHorizontal size={18}/></button>{menu === task._id && <div className="row-menu-pop"><button onClick={() => { openEdit(task); setMenu(false); }}>Edit task</button><button className="delete-option" onClick={() => deleteTask(task._id)}><Trash2 size={14}/> Delete</button></div>}</div></article>) : <div className="empty-state"><div className="empty-icon"><ListTodo size={20}/></div><strong>Nothing on your plate</strong><p>Try another filter, or add a task to get started.</p><button className="text-button" onClick={openCreate}>Create a task <ArrowRight size={14}/></button></div>}</div>
          <div className="list-footer"><span>Showing <strong>{filtered.length ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, filtered.length)}</strong> of <strong>{filtered.length}</strong> tasks</span><div className="pagination"><button disabled={page <= 1} onClick={() => setPage(p => p - 1)} aria-label="Previous page"><ChevronLeft size={16}/></button><span>Page <strong>{page}</strong> of <strong>{totalPages}</strong></span><button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} aria-label="Next page"><ChevronRight size={16}/></button></div></div>
        </section>
        <footer className="page-footer"><span>Made for meaningful work.</span><span><span className="footer-heart">✳</span> Take it one task at a time</span></footer>
      </div>
    </main>
    {modal && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setModal(false)}><form className="task-modal" onSubmit={saveTask}><div className="modal-header"><div><span className="modal-kicker">YOUR WORKSPACE</span><h2>{editing ? 'Edit task' : 'Create a task'}</h2></div><button type="button" className="icon-button modal-close" onClick={() => setModal(false)} aria-label="Close"><X size={19}/></button></div><label className="field-label">Task name<input autoFocus maxLength={120} required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="What needs to get done?"/></label><label className="field-label">Description <span className="optional-label">Optional</span><textarea rows={3} maxLength={1000} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Add a few details..."/></label><div className="form-grid"><label className="field-label">Status<select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>{statusOptions.map(s => <option key={s}>{s}</option>)}</select></label><label className="field-label">Priority<select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>{['Low','Medium','High'].map(s => <option key={s}>{s}</option>)}</select></label><label className="field-label">Project<select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>{categories.slice(1).map(s => <option key={s}>{s}</option>)}</select></label><label className="field-label">Due date<input type="date" value={form.dueDate || ''} onChange={e => setForm({ ...form, dueDate: e.target.value })}/></label></div><div className="modal-actions"><button type="button" className="cancel-button" onClick={() => setModal(false)}>Cancel</button><button className="primary-button" type="submit"><Plus size={16}/>{editing ? 'Save changes' : 'Create task'}</button></div></form></div>}
    {authModal && <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && setAuthModal(false)}><form className="task-modal auth-modal" onSubmit={authenticate}><div className="modal-header"><div><span className="modal-kicker">TASKFLOW ACCOUNT</span><h2>{authMode === 'register' ? 'Create your account' : 'Welcome back'}</h2></div><button type="button" className="icon-button modal-close" onClick={() => setAuthModal(false)} aria-label="Close"><X size={19}/></button></div><p className="auth-intro">{authMode === 'register' ? 'Save your tasks and pick up where you left off.' : 'Sign in to sync your tasks across devices.'}</p>{authMode === 'register' && <label className="field-label">Your name<input required maxLength={80} value={authForm.name} onChange={e => setAuthForm({ ...authForm, name: e.target.value })} placeholder="Jordan Davis"/></label>}<label className="field-label">Email address<input required type="email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} placeholder="you@example.com"/></label><label className="field-label">Password<input required minLength={8} type="password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} placeholder="At least 8 characters"/></label><div className="modal-actions auth-actions"><button type="button" className="auth-switch" onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}>{authMode === 'register' ? 'Already have an account? Sign in' : 'New to Taskflow? Create an account'}</button><button className="primary-button" type="submit">{authMode === 'register' ? 'Create account' : 'Sign in'} <ArrowRight size={15}/></button></div></form></div>}
    {toast && <div className="toast"><span className="toast-check"><Check size={13}/></span>{toast}</div>}
  </div>;
}

export default App;
