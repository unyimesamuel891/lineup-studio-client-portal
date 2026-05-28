import { FormEvent, useState } from "react";
import { Scissors } from "lucide-react";
import { PortalData, User } from "../types";
import { authenticate, registerCustomer } from "../lib/portalDb";

type AuthPanelProps = {
  data: PortalData;
  onDataChange: (data: PortalData) => void;
  onLogin: (user: User) => void;
};

export default function AuthPanel({ data, onDataChange, onLogin }: AuthPanelProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({
    name: "",
    email: "jordan@lineup.test",
    phone: "",
    password: "password123"
  });
  const [error, setError] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!form.email.includes("@") || form.password.length < 6) {
      setError("Use a valid email and a password with at least 6 characters.");
      return;
    }

    if (mode === "login") {
      const user = authenticate(data, form.email, form.password);
      if (!user) {
        setError("Those credentials do not match a Lineup Studio account.");
        return;
      }
      onLogin(user);
      return;
    }

    if (form.name.trim().length < 2 || form.phone.trim().length < 7) {
      setError("Add your name and phone number before creating an account.");
      return;
    }

    try {
      const result = registerCustomer(data, form);
      onDataChange(result.data);
      onLogin(result.user);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not create this account.");
    }
  };

  const useDemo = (email: string) => {
    setForm((current) => ({ ...current, email, password: "password123" }));
  };

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand-lockup">
          <span className="brand-mark">
            <Scissors size={22} />
          </span>
          <div>
            <strong>Lineup Studio</strong>
            <span>Client portal</span>
          </div>
        </div>

        <div className="auth-copy">
          <h1>{mode === "login" ? "Sign in to manage the shop day." : "Create your customer profile."}</h1>
          <p>
            Staff can run appointments and analytics. Customers can book, reschedule, and review completed
            visits.
          </p>
        </div>

        <form className="stack-form" onSubmit={submit}>
          {mode === "signup" ? (
            <>
              <label>
                Name
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Taylor Morgan"
                />
              </label>
              <label>
                Phone
                <input
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  placeholder="(555) 210-1122"
                />
              </label>
            </>
          ) : null}
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-btn" type="submit">
            {mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <div className="demo-grid">
          <button type="button" onClick={() => useDemo("jordan@lineup.test")}>
            Customer demo
          </button>
          <button type="button" onClick={() => useDemo("owner@lineup.test")}>
            Admin demo
          </button>
          <button type="button" onClick={() => useDemo("staff@lineup.test")}>
            Staff demo
          </button>
        </div>

        <button className="text-btn" type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </section>
    </main>
  );
}
