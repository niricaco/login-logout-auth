import { useEffect, useState } from "react";
import "./App.css";
import http from "axios";

function App() {
  const [nameValue, setNameValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  const [todo, setTodo] = useState("");
  const [authUser, setAuthUser] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [sectionToAppear, setSectionToAppear] = useState("registration");

  const signUp = async () => {
    try {
      await http.post("http://localhost:4000/api/signup", {
        name: nameValue,
        password: passwordValue,
      });
      alert("Successful sign");
      setNameValue("");
      setPasswordValue("");
      setSectionToAppear("login");
    } catch (err) {
      if (!err.response) return alert("Oops... Something went wrong");
      if (err.response.status === 409) return alert("Existing username");
      if (err.response.status === 400) return alert("Missing credentials");
    }
  };

  const addTodo = async () => {
    try {
      await http.post(
        "http://localhost:4000/api/todo",
        {
          todo: todo,
        },
        {
          headers: {
            authorization: localStorage.getItem("sessionId"),
          },
        }
      );
      alert("Successfully added");
      setTodo("");
    } catch (err) {
      if (err.response.status === 401) {
        alert("Session ended");
        return setSectionToAppear("login");
      }
      return alert("Oops... Something went wrong");
    }
  };

  const login = async () => {
    try {
      const response = await http.post(
        "http://localhost:4000/api/login",
        {},
        {
          headers: {
            authorization: `${authUser}:::${authPassword}`,
          },
        }
      );
      setSectionToAppear("todos");
      localStorage.setItem("sessionId", response.data);
    } catch (err) {
      return alert("Wrong username or password");
    }
  };

  const signOut = async () => {
    try {
      await http.delete(
        "http://localhost:4000/api/logout",
        {
          headers: {
            authorization: localStorage.getItem("sessionId"),
          },
        },
        {}
      );
    } catch (err) {
    } finally {
      localStorage.removeItem("sessionId");
      setAuthUser("");
      setAuthPassword("");
      setSectionToAppear("login");
    }
  };

  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) return;
    setSectionToAppear("todos");
  }, []);

  return (
    <main>
      {sectionToAppear === "registration" && (
        <section className="App">
          <h1>Registration</h1>
          <input
            type="text"
            placeholder="username"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
          />
          <input
            type="password"
            placeholder="password"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
          />
          <button onClick={signUp}>Sign up</button>
          <button onClick={() => setSectionToAppear("login")}>
            I already have an account
          </button>
        </section>
      )}

      {sectionToAppear === "login" && (
        <section className="App">
          <h1>Login</h1>
          <input
            type="text"
            placeholder="authUsername"
            value={authUser}
            onChange={(e) => setAuthUser(e.target.value)}
          />
          <input
            type="password"
            placeholder="authPassword"
            value={authPassword}
            onChange={(e) => setAuthPassword(e.target.value)}
          />
          <button onClick={login}>Login</button>
          <button onClick={() => setSectionToAppear("registration")}>
            I do not have an account
          </button>
        </section>
      )}

      {sectionToAppear === "todos" && (
        <section className="App">
          <h1>Todo</h1>
          <input
            type="text"
            placeholder="todo"
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
          />
          <button
            onClick={addTodo}
            disabled={!todo || !authUser || !authPassword}
          >
            Add todo
          </button>
          <button onClick={signOut}>Sign out</button>
        </section>
      )}
    </main>
  );
}

export default App;
