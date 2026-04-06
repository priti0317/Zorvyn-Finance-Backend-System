"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const USERS_PER_PAGE = 5;

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [recordAmount, setRecordAmount] = useState("");
  const [recordCategory, setRecordCategory] = useState("");
  const [recordType, setRecordType] = useState<"expense" | "income">("expense");
  const [loading, setLoading] = useState(false);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // ---------------- LOAD USERS ----------------
  useEffect(() => {
    fetch("/api/admin/users", { credentials: "include" })
      .then(res => res.json())
      .then(usersData => setUsers(usersData))
      .catch(() => alert("Failed to load users"));
  }, []);

  // ---------------- SEARCH + PAGINATION LOGIC ----------------
  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  // ---------------- UPDATE USER ----------------
  const updateUser = async (id: string, field: string, value: any) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Update failed");

      setUsers(prev =>
        prev.map(u =>
          u.id === id
            ? { ...u, ...data, yearlyIncome: (data.monthlyIncome || u.monthlyIncome || 0) * 12 }
            : u
        )
      );

      if (selectedUser?.id === id)
        setSelectedUser((prev: any) => ({
          ...prev,
          ...data,
          yearlyIncome: (data.monthlyIncome || prev.monthlyIncome || 0) * 12,
        }));
    } catch {
      alert("Server error");
    }
  };

  // ---------------- DELETE USER ----------------
  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Delete failed");

      alert("✅ User deleted successfully");
      setUsers(prev => prev.filter(u => u.id !== id));
      if (selectedUser?.id === id) setSelectedUser(null);
    } catch {
      alert("Server error");
    }
  };

  // ---------------- ADD RECORD ----------------
  const addRecord = async () => {
    if (!selectedUser) return alert("Select a user first");
    if (!recordAmount || (recordType === "expense" && !recordCategory)) return alert("Fill all required fields");

    setLoading(true);
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: Number(recordAmount),
          category: recordType === "expense" ? recordCategory.trim() : null,
          type: recordType,
          userId: selectedUser.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error || "Failed to add record");

      alert(`✅ ${recordType === "expense" ? "Expense" : "Bonus"} added for ${selectedUser.email}`);
      setRecordAmount("");
      setRecordCategory("");

      setUsers(prev =>
        prev.map(u => {
          if (u.id === selectedUser.id) {
            const monthlyBalance = (u.monthlyIncome || 0) - (data.monthlyExpense || u.monthlyExpense || 0);
            const yearlyBalance = (u.yearlyIncome || 0) - (data.yearlyExpense || u.yearlyExpense || 0);
            return {
              ...u,
              monthlyExpense: data.monthlyExpense,
              yearlyExpense: data.yearlyExpense,
              monthlyBalance,
              yearlyBalance,
              monthlyBonus: recordType === "income" ? (u.monthlyBonus || 0) + Number(recordAmount) : u.monthlyBonus || 0,
              yearlyBonus: recordType === "income" ? (u.yearlyBonus || 0) + Number(recordAmount) : u.yearlyBonus || 0,
            };
          }
          return u;
        })
      );
    } catch {
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const roleColor = (role: string) => {
    if (role === "ADMIN") return "#f59e0b";
    if (role === "ANALYST") return "#6366f1";
    return "#22d3ee";
  };

  const statusColor = (status: string) =>
    status === "ACTIVE" ? "#22c55e" : "#ef4444";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #080c14;
          --surface: #0e1623;
          --card: #131e2e;
          --border: #1e2f45;
          --border-hover: #2e4a6a;
          --text-primary: #e8f0fe;
          --text-secondary: #7a92b0;
          --text-muted: #3d5470;
          --accent-blue: #3b82f6;
          --accent-blue-dim: rgba(59,130,246,0.12);
          --accent-green: #22c55e;
          --accent-red: #ef4444;
          --accent-amber: #f59e0b;
          --accent-purple: #6366f1;
          --accent-cyan: #22d3ee;
          --glow: 0 0 20px rgba(59,130,246,0.15);
          --radius: 12px;
          --radius-sm: 8px;
          --font-main: 'DM Sans', sans-serif;
          --font-mono: 'Space Mono', monospace;
        }

        .ap-root {
          font-family: var(--font-main);
          background: var(--bg);
          color: var(--text-primary);
          min-height: 100vh;
          padding: 32px 24px;
          max-width: 960px;
          margin: 0 auto;
        }

        /* ---- HEADER ---- */
        .ap-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .ap-header-left { display: flex; align-items: center; gap: 14px; }
        .ap-logo {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #1d4ed8, #6366f1);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; box-shadow: 0 0 24px rgba(99,102,241,0.4);
          flex-shrink: 0;
        }
        .ap-title { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
        .ap-subtitle { font-size: 13px; color: var(--text-secondary); margin-top: 1px; }

        /* ---- BUTTONS ---- */
        .btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 16px; border: none; border-radius: var(--radius-sm);
          font-family: var(--font-main); font-size: 13.5px; font-weight: 500;
          cursor: pointer; transition: all 0.18s ease; white-space: nowrap;
          text-decoration: none;
        }
        .btn-outline {
          background: transparent;
          border: 1px solid var(--border);
          color: var(--text-secondary);
        }
        .btn-outline:hover { border-color: var(--accent-blue); color: var(--text-primary); background: var(--accent-blue-dim); }
        .btn-primary { background: var(--accent-blue); color: #fff; }
        .btn-primary:hover { background: #2563eb; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(59,130,246,0.35); }
        .btn-danger { background: rgba(239,68,68,0.1); color: var(--accent-red); border: 1px solid rgba(239,68,68,0.25); }
        .btn-danger:hover { background: rgba(239,68,68,0.2); border-color: var(--accent-red); }
        .btn-select { background: rgba(59,130,246,0.1); color: var(--accent-blue); border: 1px solid rgba(59,130,246,0.25); }
        .btn-select:hover { background: rgba(59,130,246,0.2); border-color: var(--accent-blue); }
        .btn-success { background: var(--accent-green); color: #000; font-weight: 600; }
        .btn-success:hover { background: #16a34a; transform: translateY(-1px); }
        .btn-amber { background: rgba(245,158,11,0.12); color: var(--accent-amber); border: 1px solid rgba(245,158,11,0.25); }
        .btn-amber:hover { background: rgba(245,158,11,0.2); }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }
        .btn-sm { padding: 6px 12px; font-size: 12.5px; }
        .btn-icon { width: 34px; height: 34px; padding: 0; display: inline-flex; align-items: center; justify-content: center; }

        /* ---- SECTION HEADERS ---- */
        .section-label {
          font-size: 11px; font-weight: 600; letter-spacing: 1.2px;
          text-transform: uppercase; color: var(--text-muted);
          margin-bottom: 16px; margin-top: 36px;
          display: flex; align-items: center; gap: 8px;
        }
        .section-label::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }

        /* ---- SEARCH + TOOLBAR ---- */
        .toolbar {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 16px; flex-wrap: wrap;
        }
        .search-wrap {
          flex: 1; min-width: 200px;
          position: relative;
        }
        .search-icon {
          position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
          color: var(--text-muted); font-size: 15px; pointer-events: none;
        }
        .search-input {
          width: 100%; padding: 9px 12px 9px 36px;
          background: var(--card); border: 1px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text-primary);
          font-family: var(--font-main); font-size: 14px;
          transition: border-color 0.18s;
          outline: none;
        }
        .search-input:focus { border-color: var(--accent-blue); box-shadow: 0 0 0 3px rgba(59,130,246,0.12); }
        .search-input::placeholder { color: var(--text-muted); }
        .count-badge {
          font-size: 12px; font-family: var(--font-mono);
          color: var(--text-secondary); background: var(--card);
          border: 1px solid var(--border); padding: 4px 10px; border-radius: 20px;
          white-space: nowrap;
        }

        /* ---- USER TABLE ---- */
        .user-table { width: 100%; border-collapse: collapse; }
        .user-table thead tr {
          border-bottom: 1px solid var(--border);
        }
        .user-table th {
          font-size: 11px; font-weight: 600; letter-spacing: 0.8px;
          text-transform: uppercase; color: var(--text-muted);
          padding: 10px 14px; text-align: left;
        }
        .user-table tbody tr {
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
        }
        .user-table tbody tr:hover { background: rgba(59,130,246,0.04); }
        .user-table tbody tr.selected-row { background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.2); }
        .user-table td {
          padding: 12px 14px; font-size: 13.5px; vertical-align: middle;
        }

        .user-email {
          font-weight: 500; color: var(--text-primary);
          display: flex; align-items: center; gap: 8px;
        }
        .user-avatar {
          width: 30px; height: 30px; border-radius: 8px;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; flex-shrink: 0;
          background: linear-gradient(135deg, #1d4ed8, #6366f1);
          text-transform: uppercase;
        }

        /* ---- INLINE SELECT / INPUT ---- */
        .td-select, .td-input {
          background: transparent; border: 1px solid var(--border);
          border-radius: 6px; color: var(--text-primary);
          font-family: var(--font-main); font-size: 13px;
          padding: 5px 8px; outline: none;
          transition: border-color 0.15s;
        }
        .td-select:focus, .td-input:focus { border-color: var(--accent-blue); }
        .td-input { width: 100px; }

        /* ---- BADGES ---- */
        .badge {
          display: inline-flex; align-items: center;
          padding: 3px 9px; border-radius: 20px;
          font-size: 11px; font-weight: 600; letter-spacing: 0.4px;
        }
        .badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
          margin-right: 5px; flex-shrink: 0;
        }

        /* ---- STAT CHIPS ---- */
        .stat-chip {
          display: inline-flex; flex-direction: column;
          padding: 6px 10px; border-radius: 8px;
          background: var(--surface); border: 1px solid var(--border);
          font-size: 11px; gap: 2px;
          min-width: 80px;
        }
        .stat-label { color: var(--text-muted); }
        .stat-val { font-family: var(--font-mono); font-size: 12.5px; font-weight: 700; color: var(--text-primary); }
        .stat-bonus { font-size: 10px; color: var(--accent-green); }

        /* ---- ACTIONS CELL ---- */
        .td-actions { display: flex; gap: 6px; align-items: center; }

        /* ---- PAGINATION ---- */
        .pagination {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 20px; flex-wrap: wrap; gap: 12px;
        }
        .page-info { font-size: 13px; color: var(--text-secondary); }
        .page-btns { display: flex; gap: 4px; }
        .page-btn {
          width: 34px; height: 34px; border-radius: 8px;
          display: inline-flex; align-items: center; justify-content: center;
          border: 1px solid var(--border); background: var(--card);
          color: var(--text-secondary); font-family: var(--font-mono);
          font-size: 13px; cursor: pointer; transition: all 0.15s;
        }
        .page-btn:hover:not(:disabled) { border-color: var(--accent-blue); color: var(--text-primary); background: var(--accent-blue-dim); }
        .page-btn.active { background: var(--accent-blue); border-color: var(--accent-blue); color: #fff; font-weight: 700; }
        .page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        /* ---- ADD RECORD PANEL ---- */
        .panel {
          background: var(--card); border: 1px solid var(--border);
          border-radius: var(--radius); padding: 24px; margin-top: 8px;
        }
        .panel-selected {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 14px; border-radius: var(--radius-sm);
          background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.25);
          margin-bottom: 20px; font-size: 13.5px;
        }
        .panel-selected span { color: var(--text-secondary); }
        .panel-selected b { color: var(--text-primary); }

        .form-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 160px; }
        .form-label { font-size: 11.5px; font-weight: 600; letter-spacing: 0.6px; text-transform: uppercase; color: var(--text-muted); }
        .form-input, .form-select {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-sm); color: var(--text-primary);
          font-family: var(--font-main); font-size: 14px;
          padding: 10px 14px; outline: none; transition: border-color 0.18s, box-shadow 0.18s;
        }
        .form-input:focus, .form-select:focus {
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
        }
        .form-input::placeholder { color: var(--text-muted); }

        /* ---- TYPE TOGGLE ---- */
        .type-toggle {
          display: flex; gap: 6px;
        }
        .type-btn {
          flex: 1; padding: 9px; border-radius: var(--radius-sm);
          border: 1px solid var(--border); background: transparent;
          font-family: var(--font-main); font-size: 13.5px; font-weight: 500;
          color: var(--text-secondary); cursor: pointer; transition: all 0.18s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .type-btn.active-expense {
          background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.4);
          color: var(--accent-red);
        }
        .type-btn.active-income {
          background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.4);
          color: var(--accent-green);
        }

        /* ---- EMPTY STATE ---- */
        .empty {
          text-align: center; padding: 48px 16px; color: var(--text-muted);
          font-size: 14px;
        }
        .empty-icon { font-size: 32px; margin-bottom: 12px; }

        /* ---- DIVIDER ---- */
        .divider { height: 1px; background: var(--border); margin: 32px 0; }
      `}</style>

      <div className="ap-root">
        {/* ---- HEADER ---- */}
        <div className="ap-header">
          <div className="ap-header-left">
            <div className="ap-logo">🛠</div>
            <div>
              <div className="ap-title">Admin Panel</div>
              <div className="ap-subtitle">Manage users, roles &amp; records</div>
            </div>
          </div>
          <button className="btn btn-outline" onClick={() => router.push("/dashboard")}>
            🏠 Dashboard
          </button>
        </div>

        {/* ---- USERS SECTION ---- */}
        <div className="section-label">Users</div>

        {/* TOOLBAR */}
        <div className="toolbar">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
            />
          </div>
          <div className="count-badge">{filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}</div>
        </div>

        {/* TABLE */}
        <div style={{ overflowX: "auto", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--card)" }}>
          {paginatedUsers.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">👤</div>
              {searchQuery ? "No users match your search." : "No users found."}
            </div>
          ) : (
            <table className="user-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Monthly Income</th>
                  <th>Balances</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map(u => (
                  <tr key={u.id} className={selectedUser?.id === u.id ? "selected-row" : ""}>
                    <td>
                      <div className="user-email">
                        <span className="user-avatar">{u.email?.[0] || "?"}</span>
                        <span style={{ fontSize: 13.5 }}>{u.email}</span>
                      </div>
                    </td>
                    <td>
                      <select
                        className="td-select"
                        value={u.role}
                        onChange={e => updateUser(u.id, "role", e.target.value)}
                        style={{ color: roleColor(u.role) }}
                      >
                        <option value="VIEWER">Viewer</option>
                        <option value="ANALYST">Analyst</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td>
                      <select
                        className="td-select"
                        value={u.status}
                        onChange={e => updateUser(u.id, "status", e.target.value)}
                        style={{ color: statusColor(u.status) }}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="td-input"
                        value={u.monthlyIncome || 0}
                        onChange={e => updateUser(u.id, "monthlyIncome", Number(e.target.value))}
                      />
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <div className="stat-chip">
                          <span className="stat-label">Monthly</span>
                          <span className="stat-val">₹{u.monthlyBalance || 0}</span>
                          {u.monthlyBonus ? <span className="stat-bonus">+{u.monthlyBonus}</span> : null}
                        </div>
                        <div className="stat-chip">
                          <span className="stat-label">Yearly</span>
                          <span className="stat-val">₹{u.yearlyBalance || 0}</span>
                          {u.yearlyBonus ? <span className="stat-bonus">+{u.yearlyBonus}</span> : null}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="td-actions">
                        <button
                          className="btn btn-select btn-sm"
                          onClick={() => setSelectedUser(u)}
                          title="Select for record"
                        >
                          {selectedUser?.id === u.id ? "✓ Selected" : "+ Record"}
                        </button>
                        <button
                          className="btn btn-danger btn-sm btn-icon"
                          onClick={() => handleDeleteUser(u.id)}
                          title="Delete user"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="pagination">
            <div className="page-info">
              Page {currentPage} of {totalPages}
            </div>
            <div className="page-btns">
              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  className={`page-btn${p === currentPage ? " active" : ""}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="page-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          </div>
        )}

        <div className="divider" />

        {/* ---- ADD RECORD PANEL ---- */}
        <div className="section-label">Add Expense / Bonus</div>

        <div className="panel">
          <div className="panel-selected">
            {selectedUser ? (
              <>
                <span className="user-avatar" style={{ width: 26, height: 26, fontSize: 11 }}>
                  {selectedUser.email?.[0] || "?"}
                </span>
                <span>Selected user:</span>
                <b>{selectedUser.email}</b>
              </>
            ) : (
              <span>⬆ Select a user from the table above to add a record.</span>
            )}
          </div>

          {/* Type toggle */}
          <div className="form-group" style={{ marginBottom: 16 }}>
            <div className="form-label">Record Type</div>
            <div className="type-toggle">
              <button
                className={`type-btn${recordType === "expense" ? " active-expense" : ""}`}
                onClick={() => setRecordType("expense")}
              >
                📉 Expense
              </button>
              <button
                className={`type-btn${recordType === "income" ? " active-income" : ""}`}
                onClick={() => setRecordType("income")}
              >
                📈 Bonus
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Amount (₹)</label>
              <input
                className="form-input"
                type="number"
                placeholder="Enter amount"
                value={recordAmount}
                onChange={e => setRecordAmount(e.target.value)}
              />
            </div>
            {recordType === "expense" && (
              <div className="form-group">
                <label className="form-label">Category</label>
                <input
                  className="form-input"
                  placeholder="e.g. Utilities, Travel"
                  value={recordCategory}
                  onChange={e => setRecordCategory(e.target.value)}
                />
              </div>
            )}
          </div>

          <button
            className={`btn ${recordType === "expense" ? "btn-danger" : "btn-success"}`}
            onClick={addRecord}
            disabled={loading}
            style={{ padding: "11px 24px", fontSize: 14 }}
          >
            {loading
              ? "Adding..."
              : recordType === "expense"
              ? "📉 Add Expense"
              : "📈 Add Bonus"}
          </button>
        </div>
      </div>
    </>
  );
}