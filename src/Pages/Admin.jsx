import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Admin() {
  const [add, setAdd] = useState(0);
  const nav = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "CR",
  });

  const token = localStorage.getItem("sessionToken");

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
      })
      .catch(() => nav("/login"));
  };

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

  const handleLogout = () => {
    API.post("/logout", { token }).finally(() => {
      localStorage.removeItem("sessionToken");
      localStorage.removeItem("role");
      nav("/login");
    });
  };

  const handleAddTransaction = () => {
    API.post("/transactions", form, { headers: { Authorization: token } }).then(
      () => {
        setAdd(0);
        setForm({
          date: new Date().toISOString().split("T")[0],
          description: "",
          amount: "",
          type: "CR",
        });
        fetchTransactions();
      }
    );
  };

  const handleDeleteTransaction = (id) => {
    API.delete(`/transactions/${id}`, {
      headers: { Authorization: token },
    }).then(() => fetchTransactions());
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

  return (
    <div id="container" className="flex column">
      <div
        id="topBar"
        className="flex row justify-content-space-between padding-24"
      >
        <h1>Balance Manage</h1>
        <p className="lockBtn" onClick={handleLogout}>
          <i className="fa-solid fa-lock"></i>
        </p>
      </div>

      <div id="balanceBar">
        <div id="balanceBox">
          <h1>
            Rs.{" "}
            {transactions.length > 0
              ? transactions
                  .reduce(
                    (total, t) =>
                      t.type === "CR"
                        ? total + parseFloat(t.amount)
                        : total - parseFloat(t.amount),
                    0
                  )
                  .toFixed(2)
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
        <button onClick={() => setAdd(1)}>New Transaction</button>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Closing Balance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, i) => (
              <tr key={i}>
                <td>{t.date}</td>
                <td>{t.description}</td>
                <th style= {(t.type === "CR" ) ? {color: "green"} : {color: "red"}} >
                  {t.amount} {t.type}
                </th>
                <td>{t.closingBalance.toFixed(2)}</td>
                <td>
                  <i
                    className="fa-solid fa-trash"
                    onClick={() => handleDeleteTransaction(t._id)}
                  ></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <div id="modalContainer" className={add === 1 ? "dispaly" : "hidden"}>
        <div id="add-form" className="flex column">
          <div className="flex row justify-content-space-between">
            <h2>Add Transaction</h2>
            <p className="lockBtn" onClick={() => setAdd(0)}>
              <i className="fa-solid fa-x"></i>
            </p>
          </div>

          {["date", "description", "amount"].map((field) => (
            <div key={field} className="inputBox flex row">
              <p>{field.charAt(0).toUpperCase() + field.slice(1)}:</p>
              <input
                type={
                  field === "amount"
                    ? "number"
                    : field === "date"
                    ? "date"
                    : "text"
                }
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
              />
            </div>
          ))}

          <div className="inputBox flex row">
            <p>Transaction Type:</p>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="CR">CR.</option>
              <option value="DR">DR.</option>
            </select>
          </div>

          <div className="inputBox flex column flex-end">
            <button onClick={handleAddTransaction}>Add Transaction</button>
          </div>
        </div>
      </div>
    </div>
  );
}
