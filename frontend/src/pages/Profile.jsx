import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { errorMessage } from '../api/client';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState(user.username);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  async function saveProfile(e) {
    e.preventDefault();
    setErr(''); setMsg('');
    try {
      const { data } = await api.put('/auth/profile', { username });
      setUser(data.user);
      setMsg('Profile updated.');
    } catch (e2) {
      setErr(errorMessage(e2, 'Update failed'));
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setErr(''); setMsg('');
    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword('');
      setMsg('Password changed.');
    } catch (e2) {
      setErr(errorMessage(e2, 'Password change failed'));
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-10 px-4 space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-4">Profile</h1>
        <p className="text-gray-400 text-sm mb-6">{user.email}</p>
        <form onSubmit={saveProfile} className="space-y-3">
          <input value={username} onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-panel border border-white/10 rounded px-3 py-2" />
          <button className="gradient-bg rounded px-4 py-2 font-medium">Save</button>
        </form>
      </div>
      <div>
        <h2 className="text-lg font-bold mb-4">Change password</h2>
        <form onSubmit={changePassword} className="space-y-3">
          <input type="password" placeholder="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-panel border border-white/10 rounded px-3 py-2" />
          <input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-panel border border-white/10 rounded px-3 py-2" />
          <button className="gradient-bg rounded px-4 py-2 font-medium">Update password</button>
        </form>
      </div>
      {msg && <p className="text-green-400 text-sm">{msg}</p>}
      {err && <p className="text-red-400 text-sm">{err}</p>}
    </div>
  );
}
