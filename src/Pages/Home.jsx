import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Home() {
  const nav = useNavigate();
  const token = localStorage.getItem("sessionToken");
  const [transactions, setTransactions] = useState([]);
  const [isConnecting, setIsConnecting] = useState(true);

  const calculateClosingBalances = (transactions) => {
    let balance = 0;
    return transactions.map((t) => {
      if (t.type === "CR") {
        balance += t.amount;
      } else if (t.type === "DR") {
        balance -= t.amount;
      }
      return { ...t, closingBalance: balance };
    });
  };

  const getLastTransactionTime = () => {
    if (transactions.length === 0) return "No transactions yet";
    const latest = new Date(transactions[0].createdAt);
    const diffHours = Math.floor((new Date() - latest) / (1000 * 60 * 60));
    return diffHours === 0
      ? "Last Transaction added Just now"
      : `Last Transaction added ${diffHours} hour${
          diffHours > 1 ? "s" : ""
        } ago`;
  };

  useEffect(() => {
    if (!token) {
      nav("/login");
      return;
    }
    fetchTransactions();
  }, [nav, token]);

  const fetchTransactions = () => {
    API.get("/transactions", { headers: { Authorization: token } })
      .then((res) => {
        const sortedData = [...res.data].sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);

          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB; // Different dates
          }

          return new Date(a.createdAt) - new Date(b.createdAt); // Same date → by created time
        });

        const withBalances = calculateClosingBalances(sortedData);
        setTransactions(withBalances.reverse()); // Reverse for latest first
        setIsConnecting(false);
      })
      .catch(() => nav("/login"));
  };

  const handleLogout = () => {
    API.post("/logout", { token }).finally(() => {
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("role");
      nav("/login");
    });
  };

  if (isConnecting) {
    return (
      <div id="connecting-container">
        <div id="connecting-screen"><i className="fa-solid fa-spinner fa-spin"></i>Loading</div>
      </div>
    );
  }

  return (
    <div id="container" className="flex column">
      <div
        id="topBar"
        className="flex row justify-content-space-between padding-24"
      >
        <h1>Balance View</h1>
        <p className="lockBtn" onClick={handleLogout}>
          <i className="fa-solid fa-lock"></i>
        </p>
      </div>
      <div id="balanceBar">
        <div id="balanceBox">
          <h1>
            Rs.{" "}
            {transactions.length > 0
              ? transactions[0].closingBalance.toFixed(2)
              : "0.00"}
          </h1>
          <p>
            <i className="fa-solid fa-clock"></i>
            {getLastTransactionTime()}
          </p>
        </div>
      </div>
      <div id="transactiontable">
        <h2>Transaction Log</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Closing Balance</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={i}>
                <td>{t.date}</td>
                <td>{t.description}</td>
                {t.type === "CR"}
                <th
                  style={
                    t.type === "CR" ? { color: "green" } : { color: "red" }
                  }
                >
                  {t.amount} {t.type}
                </th>
                <td>{t.closingBalance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
