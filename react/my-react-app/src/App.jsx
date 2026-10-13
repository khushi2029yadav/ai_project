import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import "./App.css";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

function App() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveSession = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setMessage(`Welcome, ${data.user.name}!`);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${apiUrl}/api/auth/${mode === "signup" ? "signup" : "login"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }
      saveSession(data);
    } catch (submitError) {
      setError(submitError.message || "Could not connect to the server");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      setError("");
      setMessage("");
      const credential = credentialResponse.credential;
      if (!credential) {
        throw new Error("Google did not return an authentication credential");
      }

      const response = await fetch(`${apiUrl}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ credential }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Google authentication failed");
      }

      saveSession(data);
    } catch (error) {
      console.error("Login Error:", error);
      setError(error.message || "Google Login Failed");
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in failed. Please try again.");
  };

  return (
    <div className="container">
      <main className="login-card">
        <div className="brand-mark" aria-hidden="true">AI</div>
        <h1>{mode === "signup" ? "Create your account" : "Welcome back"}</h1>
        <p className="subtitle">
          {mode === "signup"
            ? "Sign up to get started"
            : "Sign in to continue to your account"}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <label>
              Name
              <input
                autoComplete="name"
                name="name"
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                required
                value={name}
              />
            </label>
          )}
          <label>
            Email
            <input
              autoComplete="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            Password
            <input
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
              required
              type="password"
              value={password}
              minLength={mode === "signup" ? 8 : undefined}
            />
          </label>
          {mode === "signup" && (
            <p className="password-hint">
              Use at least 8 characters, including uppercase, lowercase, and a number.
            </p>
          )}
          {error && <p className="form-message error" role="alert">{error}</p>}
          {message && <p className="form-message success" role="status">{message}</p>}
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting
              ? "Please wait..."
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <div className="divider"><span>or continue with</span></div>
        <div className="google-button">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={handleGoogleError}
            text="continue_with"
            shape="rectangular"
            width="320"
          />
        </div>
        <p className="mode-switch">
          {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
          <button
            onClick={() => {
              setMode(mode === "signup" ? "login" : "signup");
              setError("");
              setMessage("");
            }}
            type="button"
          >
            {mode === "signup" ? "Sign in" : "Create an account"}
          </button>
        </p>
      </main>
    </div>
  );
}

export default App;