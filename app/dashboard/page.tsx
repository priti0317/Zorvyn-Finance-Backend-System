"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ExpenseChart from "@/app/components/ExpenseChart";

export default function Dashboard() {
  const router = useRouter();
  const [role, setRole] = useState<string>("");
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [userSummary, setUserSummary] = useState<any>(null);
  const [allUsersData, setAllUsersData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const res = await fetch("/api/auth/verify", { credentials: "include" });
        if (!res.ok) throw new Error("Unauthorized");
        const data = await res.json();

        const userRole = data.user.role;
        setRole(userRole);
        setCurrentUserId(data.user.id);

        if (["ADMIN", "ANALYST"].includes(userRole)) {
          await fetchAllUsers(data.user.id);
        } else {
          await fetchUserSummary();
        }
      } catch {
        router.push("/login");
      }
    };

    verifyUser();
  }, []);

  // ---------------- VIEWER ----------------
  const fetchUserSummary = async () => {
    try {
      const activityRes = await fetch("/api/records", { credentials: "include" });
      if (!activityRes.ok) throw new Error("Activity API failed");
      const recentActivity = await activityRes.json();

      const summaryRes = await fetch("/api/analytics/user-summary", { credentials: "include" });
      if (!summaryRes.ok) throw new Error("Summary API failed");
      const summaryData = await summaryRes.json();

      const monthly = {
        income: summaryData.monthlyIncome || 0,
        expense: summaryData.monthlyExpense || 0,
        balance: summaryData.monthlyBalance || 0,
      };

      const yearly = {
        income: summaryData.yearlyIncome || 0,
        expense: summaryData.yearlyExpense || 0,
        balance: summaryData.yearlyBalance || 0,
      };

      setUserSummary({
        monthly,
        yearly,
        categoryData: summaryData.categoryData,
        recentActivity,
      });
    } catch (err) {
      console.error("Viewer error:", err);
      setUserSummary(null);
      setError("Failed to load your summary");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- ADMIN / ANALYST ----------------
  const fetchAllUsers = async (currentUserId: string) => {
    try {
      const res = await fetch("/api/admin/user-analytics", { credentials: "include" });
      const data = await res.json();

      const filteredUsers = data.filter((u: any) => {
        if (role === "ADMIN") return u.id !== currentUserId && u.role !== "ADMIN";
        else return u.role !== "ADMIN";
      });

      const usersWithActivities = await Promise.all(
        filteredUsers.map(async (u: any) => {
          const activityRes = await fetch("/api/records", { credentials: "include" });
          const allActivities = await activityRes.json();

          const recentActivity = allActivities.filter(
            (r: any) => r.user?.email === u.email
          );

          return {
            ...u,
            monthlyBalance: (u.monthlyIncome || 0) - (u.monthlyExpense || 0),
            yearlyBalance: (u.yearlyIncome || 0) - (u.yearlyExpense || 0),
            recentActivity,
          };
        })
      );

      setAllUsersData(usersWithActivities);
    } catch (err) {
      console.error(err);
      setAllUsersData([]);
      setError("Failed to load all users data");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>📊 Dashboard</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <div style={styles.roleBadge}>
            Role: <b>{role}</b>
          </div>
          <button onClick={logout} style={styles.logoutBtn}>
            🚪 Logout
          </button>
        </div>
      </div>

      {role === "ADMIN" && (
        <button onClick={() => router.push("/admin")} style={styles.adminBtn}>
          🛠 Admin Panel
        </button>
      )}

      {/* ---------------- VIEWER ---------------- */}
      {role === "VIEWER" && userSummary && (
        <>
          <h2>📅 Monthly</h2>
          <div style={styles.cards}>
            <Card title="Income" value={userSummary.monthly.income} />
            <Card title="Expense" value={userSummary.monthly.expense} />
            <Card title="Balance" value={userSummary.monthly.balance} />
          </div>

          <h2>📆 Yearly</h2>
          <div style={styles.cards}>
            <Card title="Income" value={userSummary.yearly.income} />
            <Card title="Expense" value={userSummary.yearly.expense} />
            <Card title="Balance" value={userSummary.yearly.balance} />
          </div>
          {userSummary.categoryData && userSummary.categoryData.length > 0 && (
  <>
    <h3>📊 Expense Breakdown</h3>
    <ExpenseChart data={userSummary.categoryData} />
  </>
)}

          {userSummary.recentActivity?.length > 0 && (
            <>
              <h3>🕒 Recent Activities</h3>
              {userSummary.recentActivity.slice(0, 10).map((r: any, idx: number) => (
                <div key={r.id || idx} style={styles.activityCard}>
                  <p>
                    {r.type === "expense" ? "Spent" : "Received"} ₹{r.amount}
                    {r.category ? ` on ${r.category}` : ""}
                    <span style={{ color: "#555", marginLeft: 10 }}>
                      ({new Date(r.date).toLocaleString()})
                    </span>
                  </p>
                </div>
              ))}
            </>
          )}
        </>
      )}

      {/* ---------------- ADMIN / ANALYST ---------------- */}
      {(role === "ADMIN" || role === "ANALYST") && allUsersData.length > 0 && (
        <>
          <h2>👥 Users Analytics</h2>
          {allUsersData.map((u: any, idx: number) => (
            <div key={u.id || idx} style={styles.userCard}>
              <h3>
                {u.email} {u.id === currentUserId && "(You)"}
              </h3>

              <div style={styles.cards}>
                <Card title="Monthly Income" value={u.monthlyIncome} />
                <Card title="Monthly Expense" value={u.monthlyExpense} />
                <Card title="Monthly Balance" value={u.monthlyBalance} />
              </div>

              <div style={styles.cards}>
                <Card title="Yearly Income" value={u.yearlyIncome} />
                <Card title="Yearly Expense" value={u.yearlyExpense} />
                <Card title="Yearly Balance" value={u.yearlyBalance} />
              </div>

              {u.categoryData && Object.keys(u.categoryData).length > 0 && (
                <ExpenseChart data={u.categoryData} />
              )}

              {u.recentActivity?.length > 0 && (
                <>
                  <h4>🕒 Recent Activities</h4>
                  {u.recentActivity.slice(0, 10).map((r: any, rIdx: number) => (
                    <div key={r.id || rIdx} style={styles.activityCard}>
                      <p>
                        {r.type === "expense" ? "Spent" : "Received"} ₹{r.amount}
                        {r.category ? ` on ${r.category}` : ""}
                        <span style={{ color: "#555", marginLeft: 10 }}>
                          ({new Date(r.date).toLocaleString()})
                        </span>
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ---------------- CARD ----------------
function Card({ title, value }: any) {
  return (
    <div style={styles.card}>
      <h4>{title}</h4>
      <p>₹ {value || 0}</p>
    </div>
  );
}

// ---------------- STYLES ----------------
const styles: any = {
  container: { padding: 20, background: "#f4f6f9", minHeight: "100vh" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
    alignItems: "center",
  },
  roleBadge: {
    background: "#222",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: 20,
  },
  logoutBtn: {
    background: "#dc2626",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    cursor: "pointer",
  },
  adminBtn: {
    marginBottom: 20,
    padding: 10,
    background: "#000",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  cards: { display: "flex", gap: 15, marginBottom: 20 },
  card: {
    flex: 1,
    background: "#fff",
    padding: 15,
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  userCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  activityCard: {
    background: "#e2e8f0",
    padding: 10,
    marginBottom: 8,
    borderRadius: 6,
  },
};