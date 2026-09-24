import { useState } from 'react';
import api, { errMsg } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ErrorBox } from '../components/ui';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [f, setF] = useState({ name: user.name, phone: user.phone || '', password: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault(); setError('');
    try {
      const body = { name: f.name, phone: f.phone };
      if (f.password) body.password = f.password;
      const { data } = await api.put('/auth/profile', body);
      setUser(data.user); setF({ ...f, password: '' }); toast.success('Profile saved');
    } catch (err) { setError(errMsg(err)); }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <h1 className="text-2xl font-extrabold">Your profile</h1>
      <form onSubmit={save} className="card mt-4 space-y-4 p-5">
        <ErrorBox>{error}</ErrorBox>
        <div><label className="label">User ID</label><input className="input bg-gray-100" value={user.userId} disabled /></div>
        <div><label className="label" htmlFor="pn">Name</label><input id="pn" className="input" value={f.name} onChange={set('name')} required /></div>
        <div><label className="label" htmlFor="pp">Mobile number</label><input id="pp" className="input" inputMode="numeric" maxLength={10} value={f.phone} onChange={set('phone')} /></div>
        <div><label className="label" htmlFor="pw">New password <span className="font-normal text-gray-500">(leave empty to keep)</span></label><input id="pw" type="password" className="input" value={f.password} onChange={set('password')} autoComplete="new-password" /></div>
        <button className="btn-primary">Save changes</button>
      </form>
    </div>
  );
}
