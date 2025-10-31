import React, { useState, useEffect } from "react";
import "./App.css";

import axios from "axios";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

const api = axios.create({
  baseURL: "http://localhost:5218/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

interface Project {
  id: number;
  title: string;
  description?: string;
  creationDate: string;
}

interface Task {
  id: number;
  title: string;
  dueDate?: string;
  completed: boolean;
  projectId: number;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password"
               value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
      <p>No account? <Link to="/register">Register</Link></p>
    </div>
  );
}

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", { email, password });
      navigate("/");
    } catch {
      setError("Registration failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="Password"
               value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">Register</button>
      </form>
      {error && <p style={styles.error}>{error}</p>}
      <p>Already have an account? <Link to="/">Login</Link></p>
    </div>
  );
}

function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/projects")
      .then((res) => setProjects(res.data))
      .catch(() => navigate("/"));
  }, [navigate]);

  const createProject = async () => {
    if (!title.trim()) return;
    const res = await api.post("/projects", { title, description });
    setProjects([...projects, res.data]);
    setTitle("");
    setDescription("");
  };

  const deleteProject = async (id: number) => {
    await api.delete(`/projects/${id}`);
    setProjects(projects.filter((p) => p.id !== id));
  };

  return (
    <div style={styles.container}>
      <h2>Projects</h2>
      <div>
        <input value={title} placeholder="Project title"
               onChange={(e) => setTitle(e.target.value)} />
        <input value={description} placeholder="Description"
               onChange={(e) => setDescription(e.target.value)} />
        <button onClick={createProject}>Add</button>
      </div>
      <ul>
        {projects.map((p) => (
          <li key={p.id}>
            <Link to={`/projects/${p.id}`}>{p.title}</Link>
            <button onClick={() => deleteProject(p.id)}>🗑️</button>
          </li>
        ))}
      </ul>
      <button onClick={() => { localStorage.removeItem("token"); navigate("/"); }}>
        Logout
      </button>
    </div>
  );
}

function ProjectDetails() {
  const { id } = useParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/projects/${id}/tasks`)
      .then((res) => setTasks(res.data))
      .catch(() => navigate("/"));
  }, [id, navigate]);

  const addTask = async () => {
    if (!title.trim()) return;
    const res = await api.post(`/projects/${id}/tasks`, { title, dueDate });
    setTasks([...tasks, res.data]);
    setTitle("");
    setDueDate("");
  };

  const toggleTask = async (task: Task) => {
    const res = await api.put(`/tasks/${task.id}`, { ...task, completed: !task.completed });
    setTasks(tasks.map((t) => (t.id === task.id ? res.data : t)));
  };

  const deleteTask = async (taskId: number) => {
    await api.delete(`/tasks/${taskId}`);
    setTasks(tasks.filter((t) => t.id !== taskId));
  };

  return (
    <div style={styles.container}>
      <h2>Tasks</h2>
      <input value={title} placeholder="Task title" onChange={(e) => setTitle(e.target.value)} />
      <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      <button onClick={addTask}>Add Task</button>
      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            <input type="checkbox" checked={t.completed} onChange={() => toggleTask(t)} />
            {t.title} ({t.dueDate || "no date"})
            <button onClick={() => deleteTask(t.id)}>🗑️</button>
          </li>
        ))}
      </ul>
      <button onClick={() => navigate("/dashboard")}>Back</button>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: "400px",
    margin: "50px auto",
    background: "#fff",
    padding: "20px",
    borderRadius: "8px",
    fontFamily: "Arial, sans-serif",
  },
  error: {
    color: "red",
  },
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects/:id" element={<ProjectDetails />} />
      </Routes>
    </BrowserRouter>
  );
}
