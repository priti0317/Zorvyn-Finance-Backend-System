"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AddExpense() {
  const router = useRouter();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("EXPENSE");
  const [loading, setLoading] = useState(true);

  // 🔐 Verify user (cookie-based)
  useEffect(() => {
    fetch("/api/auth/verify", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          window.location.href = "/login";
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (!data?.user) return;

        // ❌ Block non-admin users
        if (data.user.role !== "ADMIN") {
          alert("Access denied. Admin only.");
          router.push("/dashboard");
        } else {
          setLoading(false);
        }
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, [router]);

  // ➕ Submit expense
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/records", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // ✅ MUST for cookie
      body: JSON.stringify({
        amount: Number(amount),
        category,
        type,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Failed to add expense");
      return;
    }

    alert("Expense added successfully ✅");

    // reset form
    setAmount("");
    setCategory("");

    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div style={{ padding: 20 }}>
        <p>Checking access...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>➕ Add Expense</h1>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={styles.input}
          required
        />

        <input
          type="text"
          placeholder="Category (food, travel)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={styles.input}
          required
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={styles.input}
        >
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>

        <button type="submit" style={styles.button}>
          Add Expense
        </button>
      </form>
    </div>
  );
}

// 🎨 Simple UI styles
const styles: any = {
  container: {
    padding: 30,
    maxWidth: 400,
    margin: "auto",
  },
  title: {
    marginBottom: 20,
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  input: {
    padding: 10,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  button: {
    padding: 12,
    background: "black",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    fontWeight: "bold",
  },
};