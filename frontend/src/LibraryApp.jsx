import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  ChevronDown,
  CircleAlert,
  Clock3,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { api } from "./lib/api.js";
import "./LibraryApp.css";
import "./WorkspaceLayout.css";

const nav = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "books", label: "Book catalog", icon: BookOpen },
  { id: "members", label: "Members", icon: Users },
  { id: "issues", label: "Circulation", icon: ArrowDownLeft },
];
const initials = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
const dateLabel = (value) =>
  value
    ? new Date(value).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";
const dateInput = (days = 0) =>
  new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

function Auth({ onAuth }) {
  const [signup, setSignup] = useState(false),
    [form, setForm] = useState({ name: "", email: "", password: "" }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      onAuth(
        await api(`/auth/${signup ? "signup" : "login"}`, {
          method: "POST",
          body: form,
        }),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="auth-layout">
      <section className="auth-story">
        <div className="story-top">
          <Brand />
          <span>
            FIELD NOTES <i>NO. 01 / 24</i>
          </span>
        </div>
        <div className="book-illustration" aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
        <div className="story-copy">
          <span className="eyebrow">THE READING ROOM</span>
          <h1>
            A good library
            <br />
            keeps growing.
          </h1>
          <p>
            A quieter way to care for the books and people in your collection.
          </p>
        </div>
        <small className="story-foot">
          EST. FOR CURIOUS MINDS <span>01 — 04</span>
        </small>
      </section>
      <section className="auth-side">
        <Brand />
        <div className="auth-box">
          <span className="eyebrow muted">LIBRARY OPERATIONS</span>
          <h2>{signup ? "Set up your library" : "Welcome back"}</h2>
          <p>
            {signup
              ? "Create the first administrator account to get started."
              : "Sign in to manage your collection."}
          </p>
          {error && <Notice message={error} />}
          <form className="fields" onSubmit={submit}>
            {signup && (
              <label>
                Full name
                <input
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Alex Morgan"
                  required
                />
              </label>
            )}
            <label>
              Email address
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@library.org"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                minLength={8}
                autoComplete={signup ? "new-password" : "current-password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder={
                  signup ? "At least 8 characters" : "Enter your password"
                }
                required
              />
            </label>
            <button className="button primary wide" disabled={busy}>
              {busy
                ? "Please wait…"
                : signup
                  ? "Create administrator"
                  : "Sign in"}
              <ArrowUpRight size={16} />
            </button>
          </form>
          <div className="auth-toggle">
            {signup ? "Already set up?" : "First time here?"}{" "}
            <button
              onClick={() => {
                setSignup(!signup);
                setError("");
              }}
            >
              {signup ? "Sign in" : "Set up administrator"}
            </button>
          </div>
          <div className="auth-lock">
            <ShieldCheck size={15} />
            Administrator access only · encrypted passwords
          </div>
        </div>
        <small className="auth-foot">
          STACKS LIBRARY SYSTEM <span>v1.0</span>
        </small>
      </section>
    </main>
  );
}

function Brand() {
  return (
    <a className="brand" href="#home">
      <span className="brand-mark">
        <LibraryBig size={18} />
      </span>
      Stacks<span className="brand-dot">.</span>
    </a>
  );
}
function Notice({ message, dismiss }) {
  return (
    <div className="notice">
      <CircleAlert size={16} />
      <span>{message}</span>
      {dismiss && (
        <button className="icon-button" aria-label="Dismiss" onClick={dismiss}>
          <X size={15} />
        </button>
      )}
    </div>
  );
}
function Empty({ icon: Icon, title, detail }) {
  return (
    <div className="empty">
      <span>
        <Icon size={20} />
      </span>
      <strong>{title}</strong>
      <p>{detail}</p>
    </div>
  );
}

function Modal({ title, detail, close, children }) {
  return (
    <div
      className="shade"
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow muted">LIBRARY DESK</span>
            <h2 id="modal-title">{title}</h2>
            <p>{detail}</p>
          </div>
          <button className="icon-button" aria-label="Close" onClick={close}>
            <X size={18} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default function LibraryApp() {
  const [token, setToken] = useState(() =>
    localStorage.getItem("stacks-token"),
  );
  const [admin, setAdmin] = useState(() =>
    JSON.parse(localStorage.getItem("stacks-user") || "null"),
  );
  const [view, setView] = useState("dashboard"),
    [books, setBooks] = useState([]),
    [members, setMembers] = useState([]),
    [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({
    titles: 0,
    copies: 0,
    available: 0,
    issued: 0,
    overdue: 0,
    members: 0,
  });
  const [error, setError] = useState(""),
    [loading, setLoading] = useState(Boolean(token)),
    [saving, setSaving] = useState(false),
    [revision, setRevision] = useState(0),
    [modal, setModal] = useState(null);
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState("all"),
    [availability, setAvailability] = useState("all"),
    [issueFilter, setIssueFilter] = useState("issued");
  const [now] = useState(Date.now);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;
    Promise.all([
      api("/books", { token }),
      api("/members", { token }),
      api("/issues", { token }),
      api("/dashboard", { token }),
    ])
      .then(([b, m, i, s]) => {
        if (!cancelled) {
          setBooks(b);
          setMembers(m);
          setIssues(i);
          setStats(s);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message);
          if (e.status === 401) signOut();
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, revision]);

  function accept(result) {
    localStorage.setItem("stacks-token", result.token);
    localStorage.setItem("stacks-user", JSON.stringify(result.user));
    setAdmin(result.user);
    setLoading(true);
    setError("");
    setToken(result.token);
  }
  function signOut() {
    localStorage.removeItem("stacks-token");
    localStorage.removeItem("stacks-user");
    setToken(null);
    setAdmin(null);
  }
  function refresh() {
    setLoading(true);
    setError("");
    setRevision((n) => n + 1);
  }
  const categories = useMemo(
    () => [...new Set(books.map((book) => book.category))].sort(),
    [books],
  );
  const visibleBooks = useMemo(
    () =>
      books.filter(
        (b) =>
          `${b.title} ${b.author} ${b.isbn}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (category === "all" || category === b.category) &&
          (availability === "all" ||
            (availability === "available"
              ? b.availableCopies > 0
              : b.availableCopies === 0)),
      ),
    [books, query, category, availability],
  );
  const visibleIssues = issues.filter(
    (item) => issueFilter === "all" || item.status === issueFilter,
  );

  async function submitForm(event) {
    event.preventDefault();
    setSaving(true);
    const data = Object.fromEntries(
      new FormData(event.currentTarget).entries(),
    );
    const path =
      modal.type === "book"
        ? modal.book
          ? `/books/${modal.book._id}`
          : "/books"
        : modal.type === "member"
          ? modal.member
            ? `/members/${modal.member._id}`
            : "/members"
          : "/issues";
    try {
      await api(path, {
        token,
        method:
          (modal.type === "book" && modal.book) ||
          (modal.type === "member" && modal.member)
            ? "PUT"
            : "POST",
        body: data,
      });
      setModal(modal.returnToIssue ? { type: "issue" } : null);
      refresh();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  async function remove(path, kind) {
    if (!window.confirm(`Remove this ${kind}?`)) return;
    try {
      await api(path, { token, method: "DELETE" });
      refresh();
    } catch (e) {
      setError(e.message);
    }
  }
  async function checkIn(id) {
    try {
      await api(`/issues/${id}/return`, { token, method: "PATCH" });
      refresh();
    } catch (e) {
      setError(e.message);
    }
  }
  if (!token) return <Auth onAuth={accept} />;
  const currentNav = nav.find((item) => item.id === view);
  return (
    <div className="workspace">
      <aside className="sidebar">
        <Brand />
        <span className="nav-caption">WORKSPACE</span>
        <nav>
          {nav.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`nav-link ${view === id ? "selected" : ""}`}
              title={label}
              onClick={() => {
                setView(id);
                setError("");
              }}
            >
              <Icon size={17} />
              <span>{label}</span>
              {id === "issues" && stats.overdue > 0 && (
                <i className="nav-badge">{stats.overdue}</i>
              )}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <div className="shelf-note">
            <Bookmark size={15} />
            <span>
              <strong>Your shelves, in sync.</strong>
              <small>{stats.titles} titles in the catalog</small>
            </span>
          </div>
          <div className="profile">
            <span className="avatar dark-avatar">{initials(admin?.name)}</span>
            <span className="profile-name">
              <strong>{admin?.name || "Administrator"}</strong>
              <small>Administrator</small>
            </span>
            <button
              className="icon-button side-logout"
              title="Sign out"
              aria-label="Sign out"
              onClick={signOut}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main">
        <header className="topbar">
          <div className="crumb">
            <span>Stacks</span>
            <i>/</i>
            <strong>{currentNav?.label}</strong>
          </div>
          <div className="top-tools">
            <span className="online">
              <i />
              SYSTEM ONLINE
            </span>
            <span className="today">
              <CalendarDays size={14} />
              {new Date().toLocaleDateString("en", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
            <span className="avatar top-avatar">{initials(admin?.name)}</span>
          </div>
        </header>
        <div className="page">
          {error && <Notice message={error} dismiss={() => setError("")} />}
          {loading && (
            <div className="loading">
              <i />
              Updating your library…
            </div>
          )}
          {view === "dashboard" && (
            <Dashboard stats={stats} issues={issues} onNavigate={setView} now={now} />
          )}
          {view === "books" && (
            <>
              <Heading
                eyebrow="THE COLLECTION"
                title="Book catalog"
                detail="Every title on the shelf, accounted for."
                action={
                  <button
                    className="button primary"
                    onClick={() => setModal({ type: "book" })}
                  >
                    <Plus size={16} />
                    Add a book
                  </button>
                }
              />
              <section className="panel table-panel">
                <div className="toolbar">
                  <div className="search">
                    <Search size={15} />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search title, author, ISBN…"
                      aria-label="Search catalog"
                    />
                  </div>
                  <div className="filters">
                    <label className="select">
                      <span className="sr-only">Category</span>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        <option value="all">All categories</option>
                        {categories.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                      <ChevronDown size={13} />
                    </label>
                    <label className="select">
                      <span className="sr-only">Availability</span>
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                      >
                        <option value="all">Any availability</option>
                        <option value="available">Available</option>
                        <option value="unavailable">Checked out</option>
                      </select>
                      <ChevronDown size={13} />
                    </label>
                  </div>
                </div>
                <div className="table-meta">
                  <span>{visibleBooks.length} titles</span>
                  <span>UPDATED LIVE</span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>BOOK / AUTHOR</th>
                        <th>ISBN</th>
                        <th>CATEGORY</th>
                        <th>IN CIRCULATION</th>
                        <th>
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleBooks.map((book, i) => (
                        <tr key={book._id}>
                          <td>
                            <div className="book-cell">
                              <span className={`book-cover cover-${i % 5}`}>
                                <BookOpen size={15} />
                              </span>
                              <span>
                                <strong>{book.title}</strong>
                                <small>{book.author}</small>
                              </span>
                            </div>
                          </td>
                          <td className="isbn">{book.isbn}</td>
                          <td>{book.category}</td>
                          <td>
                            <div className="stock">
                              <strong>{book.availableCopies}</strong>
                              <span> / {book.totalCopies}</span>
                              <i
                                className={
                                  book.availableCopies
                                    ? "in-stock"
                                    : "out-stock"
                                }
                              >
                                {book.availableCopies ? "Available" : "On loan"}
                              </i>
                            </div>
                          </td>
                          <td>
                            <div className="row-actions">
                              <button
                                className="icon-button"
                                title="Edit title"
                                aria-label={`Edit ${book.title}`}
                                onClick={() => setModal({ type: "book", book })}
                              >
                                <Settings2 size={15} />
                              </button>
                              <button
                                className="icon-button danger"
                                title="Remove title"
                                aria-label={`Remove ${book.title}`}
                                onClick={() =>
                                  remove(`/books/${book._id}`, "book")
                                }
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!visibleBooks.length && (
                    <Empty
                      icon={BookOpen}
                      title="No matching titles"
                      detail="Try another search or add a book to the catalog."
                    />
                  )}
                </div>
              </section>
            </>
          )}
          {view === "members" && (
            <>
              <Heading
                eyebrow="YOUR READING COMMUNITY"
                title="Members"
                detail="The readers who bring your shelves to life."
                action={
                  <button
                    className="button primary"
                    onClick={() => setModal({ type: "member" })}
                  >
                    <Plus size={16} />
                    Add a member
                  </button>
                }
              />
              <section className="panel table-panel">
                <div className="table-meta member-meta">
                  <span>{members.length} registered readers</span>
                  <span>MEMBER DIRECTORY</span>
                </div>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>MEMBER</th>
                        <th>EMAIL ADDRESS</th>
                        <th>JOINED</th>
                        <th>
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((member, i) => (
                        <tr key={member._id}>
                          <td>
                            <div className="member-cell">
                              <span className={`avatar avatar-${i % 4}`}>
                                {initials(member.name)}
                              </span>
                              <strong>{member.name}</strong>
                            </div>
                          </td>
                          <td>{member.email}</td>
                          <td>{dateLabel(member.createdAt)}</td>
                          <td>
                            <div className="row-actions">
                              <button
                                className="icon-button"
                                title="Edit member"
                                aria-label={`Edit ${member.name}`}
                                onClick={() => setModal({ type: "member", member })}
                              >
                                <Settings2 size={15} />
                              </button>
                              <button
                                className="icon-button danger"
                                title="Remove member"
                                aria-label={`Remove ${member.name}`}
                                onClick={() =>
                                  remove(`/members/${member._id}`, "member")
                                }
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!members.length && (
                    <Empty
                      icon={Users}
                      title="No members yet"
                      detail="Add your first reader to start checking out books."
                    />
                  )}
                </div>
              </section>
            </>
          )}
          {view === "issues" && (
            <>
              <Heading
                eyebrow="LOANS & RETURNS"
                title="Circulation"
                detail="Keep track of what’s out and welcome each book back."
                action={
                  <button
                    className="button primary"
                    onClick={() => setModal({ type: "issue" })}
                  >
                    <Plus size={16} />
                    New checkout
                  </button>
                }
              />
              <section className="panel table-panel">
                <div className="circulation-toolbar">
                  <div
                    className="tabs"
                    role="tablist"
                    aria-label="Filter circulation"
                  >
                    {[
                      { id: "issued", label: "On loan" },
                      { id: "returned", label: "Returned" },
                      { id: "all", label: "All activity" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        role="tab"
                        aria-selected={issueFilter === tab.id}
                        className={issueFilter === tab.id ? "tab-active" : ""}
                        onClick={() => setIssueFilter(tab.id)}
                      >
                        {tab.label}
                        {tab.id === "issued" && (
                          <span>
                            {
                              issues.filter((item) => item.status === "issued")
                                .length
                            }
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                  <span className="record-count">
                    {visibleIssues.length} records
                  </span>
                </div>
                <div className="table-scroll">
                  <IssueTable
                    issues={visibleIssues}
                    onReturn={checkIn}
                    now={now}
                    showEmpty={false}
                  />
                </div>
                {!visibleIssues.length && (
                  <Empty
                    icon={Clock3}
                    title={
                      issueFilter === "issued"
                        ? "No open loans"
                        : issueFilter === "returned"
                          ? "No returned books yet"
                          : "No circulation activity yet"
                    }
                    detail={
                      issueFilter === "issued"
                        ? "Check out a title to start tracking loans."
                        : "Completed check-ins will appear here."
                    }
                  />
                )}
              </section>
            </>
          )}
        </div>
      </main>
      {modal && (
        <Modal
          title={
            modal.type === "book"
              ? modal.book
                ? "Edit title"
                : "Add to the catalog"
              : modal.type === "member"
                ? modal.member
                  ? "Edit member"
                  : "Add a member"
                : "Check out a book"
          }
          detail={
            modal.type === "book"
              ? "A well-kept catalog makes a well-used library."
              : modal.type === "member"
                ? modal.member
                  ? "Update this member’s details or reset their password."
                  : "Give a reader access to your collection."
                : "Select a member and a title with copies available."
          }
          close={() => setModal(null)}
        >
          <form className="fields modal-form" onSubmit={submitForm}>
            {modal.type === "book" ? (
              <>
                <label>
                  Book title
                  <input
                    name="title"
                    defaultValue={modal.book?.title}
                    placeholder="The Creative Act"
                    required
                    maxLength="180"
                  />
                </label>
                <div className="field-row">
                  <label>
                    Author
                    <input
                      name="author"
                      defaultValue={modal.book?.author}
                      placeholder="Rick Rubin"
                      required
                    />
                  </label>
                  <label>
                    ISBN
                    <input
                      name="isbn"
                      defaultValue={modal.book?.isbn}
                      placeholder="978-0-593-49014-3"
                      required
                    />
                  </label>
                </div>
                <div className="field-row">
                  <label>
                    Category
                    <input
                      name="category"
                      defaultValue={modal.book?.category}
                      placeholder="Arts & culture"
                      required
                    />
                  </label>
                  <label>
                    Total copies
                    <input
                      name="totalCopies"
                      type="number"
                      min="1"
                      defaultValue={modal.book?.totalCopies || 1}
                      required
                    />
                  </label>
                </div>
              </>
            ) : modal.type === "member" ? (
              <>
                <label>
                  Full name
                  <input
                    name="name"
                    autoComplete="name"
                    defaultValue={modal.member?.name}
                    placeholder="Jordan Lee"
                    required
                    maxLength="100"
                  />
                </label>
                <label>
                  Email address
                  <input
                    name="email"
                    type="email"
                    defaultValue={modal.member?.email}
                    placeholder="jordan@example.com"
                    required
                  />
                </label>
                <label>
                  Temporary password
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    minLength="8"
                    placeholder={modal.member ? "Leave blank to keep current password" : "At least 8 characters"}
                    required={!modal.member}
                  />
                </label>
              </>
            ) : (
              <>
                <label>
                  Member
                  <select name="userId" defaultValue="" required>
                    <option value="" disabled>
                      Select a member
                    </option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} · {member.email}
                      </option>
                    ))}
                  </select>
                  {!members.length && (
                    <button
                      type="button"
                      className="text-action"
                      onClick={() =>
                        setModal({ type: "member", returnToIssue: true })
                      }
                    >
                      No members yet · Add a member
                    </button>
                  )}
                </label>
                <label>
                  Book
                  <select name="bookId" defaultValue="" required>
                    <option value="" disabled>
                      Select an available title
                    </option>
                    {books
                      .filter((book) => book.availableCopies > 0)
                      .map((book) => (
                        <option key={book._id} value={book._id}>
                          {book.title} · {book.availableCopies} available
                        </option>
                      ))}
                  </select>
                  {!books.some((book) => book.availableCopies > 0) && (
                    <button
                      type="button"
                      className="text-action"
                      onClick={() =>
                        setModal({ type: "book", returnToIssue: true })
                      }
                    >
                      No available copies · Add a book
                    </button>
                  )}
                </label>
                <label>
                  Due date
                  <input
                    name="dueDate"
                    type="date"
                    min={dateInput(1)}
                    defaultValue={dateInput(14)}
                    required
                  />
                </label>
              </>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="button quiet"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button
                className="button primary"
                disabled={
                  saving ||
                  (modal.type === "issue" &&
                    (!members.length ||
                      !books.some((book) => book.availableCopies > 0)))
                }
              >
                {saving
                  ? "Saving…"
                  : modal.type === "book"
                    ? modal.book
                      ? "Save changes"
                      : "Add book"
                    : modal.type === "member"
                      ? "Add member"
                      : "Confirm checkout"}
                <Check size={15} />
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Heading({ eyebrow, title, detail, action }) {
  return (
    <div className="heading">
      <div>
        <span className="eyebrow muted">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{detail}</p>
      </div>
      {action}
    </div>
  );
}
function Stat({ label, value, detail, icon: Icon, tone, tag }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span className={`stat-icon ${tone}`}>
          <Icon size={17} />
        </span>
        <span className="stat-tag">{tag}</span>
      </div>
      <strong className="stat-value">
        {Number(value || 0).toLocaleString()}
      </strong>
      <span className="stat-label">{label}</span>
      <small>{detail}</small>
    </article>
  );
}
function Dashboard({ stats, issues, onNavigate, now }) {
  const hour = new Date(now).getHours();
  const greeting =
    hour < 12 ? "Good morning." : hour < 18 ? "Good afternoon." : "Good evening.";
  const max = Math.max(
    stats.available || 0,
    stats.issued || 0,
    stats.titles || 0,
    1,
  );
  return (
    <>
      <Heading
        eyebrow="YOUR LIBRARY AT A GLANCE"
        title={greeting}
        detail="Here’s what’s happening across your shelves."
        action={
          <button
            className="button primary"
            onClick={() => onNavigate("issues")}
          >
            <Plus size={16} />
            New checkout
          </button>
        }
      />
      {stats.overdue > 0 && (
        <button className="overdue" onClick={() => onNavigate("issues")}>
          <Clock3 size={17} />
          <span>
            <strong>
              {stats.overdue} {stats.overdue === 1 ? "book is" : "books are"}{" "}
              overdue
            </strong>
            <small>Review your open loans and check them back in.</small>
          </span>
          <ArrowUpRight size={16} />
        </button>
      )}
      <section className="stats">
        {[
          {
            label: "Books in collection",
            value: stats.copies,
            detail: `${stats.titles} distinct titles`,
            icon: BookOpen,
            tone: "tone-green",
            tag: "COLLECTION",
          },
          {
            label: "Currently available",
            value: stats.available,
            detail: `${stats.copies ? Math.round((stats.available / stats.copies) * 100) : 0}% of all copies`,
            icon: Bookmark,
            tone: "tone-blue",
            tag: "ON SHELF",
          },
          {
            label: "On loan",
            value: stats.issued,
            detail: `${stats.overdue} overdue`,
            icon: ArrowUpRight,
            tone: "tone-coral",
            tag: "CIRCULATING",
          },
          {
            label: "Active members",
            value: stats.members,
            detail: "registered readers",
            icon: Users,
            tone: "tone-gold",
            tag: "COMMUNITY",
          },
        ].map((item) => (
          <Stat key={item.label} {...item} />
        ))}
      </section>
      <section className="dashboard-grid">
        <div className="panel chart-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow muted">COLLECTION HEALTH</span>
              <h2>At a glance</h2>
            </div>
            <button className="text-action" onClick={() => onNavigate("books")}>
              View catalog <ArrowUpRight size={13} />
            </button>
          </div>
          <div className="bars">
            {[
              {
                label: "Available",
                value: stats.available,
                color: "var(--green)",
              },
              { label: "On loan", value: stats.issued, color: "var(--coral)" },
              {
                label: "Catalog titles",
                value: stats.titles,
                color: "var(--blue)",
              },
            ].map((item) => (
              <div key={item.label}>
                <div className="bar-label">
                  <span>{item.label}</span>
                  <strong>{item.value || 0}</strong>
                </div>
                <div className="bar-bg">
                  <i
                    style={{
                      width: `${item.value ? Math.max((item.value / max) * 100, 7) : 0}%`,
                      background: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="panel-foot">
            <span>
              <i />
              Inventory in real time
            </span>
            <span>{stats.copies || 0} copies total</span>
          </div>
        </div>
        <div className="panel actions-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow muted">QUICK ACTIONS</span>
              <h2>At the desk</h2>
            </div>
            <Settings2 size={16} className="grey" />
          </div>
          {[
            {
              label: "Browse the catalog",
              detail: `${stats.titles || 0} titles · ${stats.available || 0} available`,
              icon: BookOpen,
              color: "quick-blue",
              page: "books",
            },
            {
              label: "Member directory",
              detail: `${stats.members || 0} registered readers`,
              icon: Users,
              color: "quick-gold",
              page: "members",
            },
            {
              label: "Open loans",
              detail: `${stats.issued || 0} books with members`,
              icon: Clock3,
              color: "quick-coral",
              page: "issues",
            },
          ].map(({ label, detail, icon: Icon, color, page }) => (
            <button
              className="quick-action"
              key={label}
              onClick={() => onNavigate(page)}
            >
              <span className={`quick-icon ${color}`}>
                <Icon size={16} />
              </span>
              <span>
                <strong>{label}</strong>
                <small>{detail}</small>
              </span>
              <ArrowUpRight size={15} />
            </button>
          ))}
        </div>
      </section>
      <section className="panel recent">
        <div className="panel-heading">
          <div>
            <span className="eyebrow muted">LATEST ACTIVITY</span>
            <h2>Recent checkouts</h2>
          </div>
          <button className="text-action" onClick={() => onNavigate("issues")}>
            All circulation <ArrowUpRight size={13} />
          </button>
        </div>
        <div className="table-scroll">
          <IssueTable
            issues={issues.slice(0, 5)}
            compact
            onReturn={() => onNavigate("issues")}
            now={now}
          />
        </div>
      </section>
    </>
  );
}
function IssueTable({ issues, compact = false, onReturn, now, showEmpty = true }) {
  if (!issues.length && showEmpty)
    return (
      <Empty
        icon={Clock3}
        title="No circulation activity yet"
        detail="New checkouts will appear here."
      />
    );
  if (!issues.length) return null;
  return (
    <table>
      <thead>
        <tr>
          <th>TITLE</th>
          <th>MEMBER</th>
          <th>ISSUED</th>
          <th>DUE DATE</th>
          <th>STATUS</th>
          {!compact && (
            <th>
              <span className="sr-only">Action</span>
            </th>
          )}
        </tr>
      </thead>
      <tbody>
        {issues.map((issue) => {
          const late =
            issue.status === "issued" && new Date(issue.dueDate).getTime() < now;
          return (
            <tr key={issue._id}>
              <td>
                <span className="issue-title">
                  <strong>{issue.bookId?.title || "Removed title"}</strong>
                  <small>{issue.bookId?.author || "—"}</small>
                </span>
              </td>
              <td>
                <span className="issue-member">
                  <i className="avatar tiny">{initials(issue.userId?.name)}</i>
                  {issue.userId?.name || "Former member"}
                </span>
              </td>
              <td>{dateLabel(issue.issueDate)}</td>
              <td className={late ? "late" : ""}>{dateLabel(issue.dueDate)}</td>
              <td>
                <span
                  className={`status ${issue.status === "returned" ? "returned" : late ? "late-status" : "on-loan"}`}
                >
                  <i />
                  {issue.status === "returned"
                    ? "Returned"
                    : late
                      ? "Overdue"
                      : "On loan"}
                </span>
              </td>
              {!compact && (
                <td>
                  {issue.status === "issued" && (
                    <button
                      className="checkin"
                      onClick={() => onReturn(issue._id)}
                    >
                      <ArrowDownLeft size={13} />
                      Check in
                    </button>
                  )}
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
