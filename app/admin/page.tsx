"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [recordAmount, setRecordAmount] = useState("");
  const [recordCategory, setRecordCategory] = useState("");
  const [recordType, setRecordType] = useState<"expense" | "income">("expense");
  const [loading, setLoading] = useState(false);

  // ---------------- LOAD USERS ----------------
  useEffect(() => {
    fetch("/api/admin/users", { credentials: "include" })
      .then(res => res.json())
      .then(usersData => setUsers(usersData))
      .catch(() => alert("Failed to load users"));
  }, []);

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
        setSelectedUser(prev => ({
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

  // ---------------- ADD RECORD (EXPENSE / BONUS) ----------------
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

      // Update user's balances locally
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

  return (
    <div style={styles.container}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>🛠 Admin Panel</h1>
        <button
          onClick={() => router.push("/dashboard")}
          style={{ ...styles.selectBtn, background: "#16a34a" }}
        >
          🏠 Go to Dashboard
        </button>
      </div>

      <h2>Users (excluding yourself)</h2>
      {users.length === 0 && <p>No users found</p>}

      {users.map(u => (
        <div key={u.id} style={styles.userCard}>
          <b>{u.email}</b>

          <div style={styles.row}>
            Role:
            <select value={u.role} onChange={e => updateUser(u.id, "role", e.target.value)}>
              <option value="VIEWER">Viewer</option>
              <option value="ANALYST">Analyst</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div style={styles.row}>
            Status:
            <select value={u.status} onChange={e => updateUser(u.id, "status", e.target.value)}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div style={styles.row}>
            Monthly Income:
            <input
              type="number"
              value={u.monthlyIncome || 0}
              onChange={e => updateUser(u.id, "monthlyIncome", Number(e.target.value))}
              style={styles.inputSmall}
            />
          </div>

          <div style={styles.row}>
            Yearly Income: <b>₹ {u.yearlyIncome || 0}</b>
          </div>

          <div style={styles.row}>
            Monthly Balance: <b>₹ {u.monthlyBalance || 0} {u.monthlyBonus ? `( +${u.monthlyBonus} )` : ""}</b>
          </div>

          <div style={styles.row}>
            Yearly Balance: <b>₹ {u.yearlyBalance || 0} {u.yearlyBonus ? `( +${u.yearlyBonus} )` : ""}</b>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => setSelectedUser(u)} style={styles.selectBtn}>
              Select for Record
            </button>
            <button
              onClick={() => handleDeleteUser(u.id)}
              style={{ ...styles.selectBtn, background: "#dc2626" }}
            >
              Delete User
            </button>
          </div>
        </div>
      ))}

      <h2>➕ Add Expense / Bonus</h2>
      <p>Selected User: <b>{selectedUser?.email || "None"}</b></p>

      <div style={styles.row}>
        Type:
        <select value={recordType} onChange={e => setRecordType(e.target.value as any)}>
          <option value="expense">Expense</option>
          <option value="income">Bonus</option>
        </select>
      </div>

      <input
        placeholder="Amount"
        value={recordAmount}
        onChange={e => setRecordAmount(e.target.value)}
        style={styles.input}
      />
      {recordType === "expense" && (
        <input
          placeholder="Category"
          value={recordCategory}
          onChange={e => setRecordCategory(e.target.value)}
          style={styles.input}
        />
      )}

      <button
        onClick={addRecord}
        style={styles.expenseBtn}
        disabled={loading}
      >
        {loading ? "Adding..." : recordType === "expense" ? "Add Expense" : "Add Bonus"}
      </button>
    </div>
  );
}

const styles: any = {
  container: { padding: 20, minHeight: "100vh", background: "#0f172a", color: "#fff" },
  userCard: { border: "1px solid #334155", padding: 12, marginBottom: 10, borderRadius: 8 },
  row: { marginTop: 5, display: "flex", alignItems: "center", gap: 10 },
  selectBtn: { marginTop: 8, padding: "6px 10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer" },
  input: { display: "block", marginBottom: 10, padding: 8, width: 250 },
  inputSmall: { padding: 4, width: 120 },
  expenseBtn: { padding: "10px 16px", background: "#dc2626", border: "none", color: "#fff", borderRadius: 6, cursor: "pointer", marginBottom: 20 },
};