import { useState } from 'react'
import { requireSupabase } from '../../lib/supabase.js'
import { sitePath } from '../../lib/sitePath.js'

export default function AdminLogin({ onSignedIn, error, onError }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    onError('')
    try {
      const { error: signInError } = await requireSupabase().auth.signInWithPassword({ email, password })
      if (signInError) throw signInError
      onSignedIn()
    } catch (loginError) {
      onError(loginError.message || 'Could not sign in.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="admin-login-page">
      <a className="admin-back-link" href={sitePath()}>← Back to portfolio</a>
      <form className="login-card" onSubmit={submit}>
        <span className="admin-eyebrow">Portfolio control room</span>
        <h1>Welcome back.</h1>
        <p>Sign in with your portfolio administrator account.</p>
        {error && <div className="admin-alert alert-error" role="alert">{error}</div>}
        <label className="admin-field">Email address
          <input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </label>
        <label className="admin-field">Password
          <input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        </label>
        <button className="admin-button button-accent login-submit" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
