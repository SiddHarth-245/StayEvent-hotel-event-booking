import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ErrorBox } from '../components/ui';
import { errMsg } from '../utils/api';

// Shared card for login + register. Simple ID + password, nothing else needed.
function AuthCard({ mode }) {
  const { login, register } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const isLogin = mode === 'login';
  const [f, setF] = useState({ name: '', userId: '', password: '', phone: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const from = loc.state?.from || '/';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isLogin && (!f.name.trim() || f.userId.length < 3 || f.password.length < 4)) return setError('Enter your name, a user ID (3+ characters) and a password (4+ characters).');
    setBusy(true);
    try {
      const u = isLogin ? await login(f.userId, f.password) : await register(f);
      toast.success(`Welcome, ${u.name.split(' ')[0]}!`);
      nav(u.role === 'admin' && from === '/' ? '/admin' : from, { replace: true });
    } catch (err) { setError(errMsg(err)); } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-8 px-4 py-10 md:grid-cols-2">
      <div className="hidden rounded-xl bg-brand p-8 text-white md:block">
        <p className="text-2xl font-extrabold">{isLogin ? 'Welcome back' : 'Join StayEvent in seconds'}</p>
        <ul className="mt-4 space-y-3 text-sm text-white/90">
          <li>✓ Just a user ID and a password. No email or OTP needed.</li>
          <li>✓ Book hotels and event venues in one place.</li>
          <li>✓ Pay with UPI, card, net banking, wallet or at the property.</li>
          <li>✓ See all your bookings and cancel free until 24 hours before.</li>
        </ul>
      </div>
      <form onSubmit={submit} className="card p-6" noValidate>
        <h1 className="text-2xl font-extrabold">{isLogin ? 'Sign in' : 'Create your account'}</h1>
        {loc.state?.reason && <p className="mt-2 rounded-md bg-brand-light px-3 py-2 text-sm text-brand">{loc.state.reason}</p>}
        <div className="mt-4 space-y-4">
          <ErrorBox>{error}</ErrorBox>
          {!isLogin && <div><label className="label" htmlFor="name">Your name</label><input id="name" className="input" value={f.name} onChange={set('name')} autoComplete="name" /></div>}
          <div><label className="label" htmlFor="uid">User ID</label><input id="uid" className="input" value={f.userId} onChange={set('userId')} placeholder="e.g. rahul123" autoComplete="username" autoCapitalize="none" /></div>
          <div><label className="label" htmlFor="pw">Password</label><input id="pw" type="password" className="input" value={f.password} onChange={set('password')} autoComplete={isLogin ? 'current-password' : 'new-password'} /></div>
          {!isLogin && <div><label className="label" htmlFor="ph">Mobile number <span className="font-normal text-gray-500">(optional)</span></label><input id="ph" className="input" inputMode="numeric" maxLength={10} value={f.phone} onChange={set('phone')} /></div>}
          <button className="btn-primary w-full" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}</button>
        </div>
        <p className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? <>New here? <Link to="/register" state={loc.state} className="link">Create an account</Link></> : <>Already have an account? <Link to="/login" state={loc.state} className="link">Sign in</Link></>}
        </p>
        {isLogin && <p className="mt-3 rounded bg-mist p-2 text-center text-xs text-gray-500">Demo: customer <b>demo / demo123</b> · admin <b>admin / admin123</b></p>}
      </form>
    </div>
  );
}
export const Login = () => <AuthCard mode="login" />;
export const Register = () => <AuthCard mode="register" />;
