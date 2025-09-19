import { FormEvent, useMemo, useState } from 'react';
import { useData } from '../context/DataContext';
import type { UserRole } from '../types';

const roles: { role: UserRole; description: string }[] = [
  { role: 'Administrator', description: 'District-level oversight & compliance' },
  { role: 'Program Specialist', description: 'Coordinates follow-up actions and IEP teams' },
  { role: 'School Site Leader', description: 'Monitors school-wide incidents and staff response' },
  { role: 'Behavior Analyst', description: 'Reviews plans and recommends proactive strategies' },
  { role: 'Crisis Responder', description: 'Documents on-the-ground interventions' }
];

const randomId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const sampleSites = ['Sunset Middle School', 'Pacific High School', 'Harbor Elementary'];

export default function LoginPortal() {
  const { login } = useData();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('School Site Leader');
  const [site, setSite] = useState(sampleSites[0]);
  const [error, setError] = useState<string | null>(null);

  const roleDetails = useMemo(() => roles.find((item) => item.role === role)?.description, [role]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Please provide your name and district email address to continue.');
      return;
    }

    setError(null);
    login({ id: randomId(), name: name.trim(), email: email.trim(), role, site });
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-brand">
          <span className="badge">FERPA-Compliant Portal</span>
          <h1>BER Guardian</h1>
          <p>
            Securely capture, review, and report California Behavior Emergency Reports (BERs) with
            confidence and fidelity to Nonviolent Crisis Intervention® best practices.
          </p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label>
            <span>Full name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g., Alex Rivera"
              required
              autoFocus
            />
          </label>
          <label>
            <span>District email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="name@district.org"
              required
            />
          </label>
          <label>
            <span>User role</span>
            <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              {roles.map((option) => (
                <option key={option.role} value={option.role}>
                  {option.role}
                </option>
              ))}
            </select>
            <small>{roleDetails}</small>
          </label>
          <label>
            <span>School / program site</span>
            <input
              value={site}
              onChange={(event) => setSite(event.target.value)}
              list="site-options"
              placeholder="e.g., Horizon Academy"
            />
            <datalist id="site-options">
              {sampleSites.map((item) => (
                <option key={item} value={item} />
              ))}
            </datalist>
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit">Enter secure workspace</button>
        </form>
        <div className="login-footer">
          <p>
            Need help with mandated timelines? BER Guardian automates reminders for parent notification,
            debrief documentation, and district submissions so nothing falls through the cracks.
          </p>
        </div>
      </div>
    </div>
  );
}
