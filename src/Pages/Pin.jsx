import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function PIN() {
  const [incorrect, setIncorrect] = useState(0);
  const [pin, setPin] = useState("");
  const nav = useNavigate();

  const handleDigitPress = (digit) => {
    if (pin.length < 4) {
      setPin((prev) => prev + digit);
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      // Call backend API for login
      API.post("/login", { pin })
        .then((res) => {
          localStorage.setItem("sessionToken", res.data.token);
          localStorage.setItem("role", res.data.role);
          if (res.data.role === "Home") nav("/");
          else if (res.data.role === "Admin") nav("/admin");
        })
        .catch(() => {
          setIncorrect(1);
          setPin("");
        });
    }
  }, [pin, nav]);

  return (
    <div
      id="container"
      className="flex column justify-content-center align-items-center"
    >
      <div id="pin-form" className="flex column">
        <h2>Enter PIN</h2>
        <p className={incorrect === 0 ? "alert hidden" : "alert display"}>
          Incorrect PIN !
        </p>
        <div id="keypad">
          {[1,2,3,4,5,6,7,8,9,0].map(num => (
            <p key={num} className="cell" onClick={() => handleDigitPress(num)}>
              {num}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
