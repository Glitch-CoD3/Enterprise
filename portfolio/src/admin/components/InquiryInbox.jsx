import { useEffect, useState } from 'react'

export default function InquiryInbox({ inquiries, messages, error, onRefresh, onReply }) {
  const [selectedId, setSelectedId] = useState(() => inquiries[0]?.id ?? null)
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const [localError, setLocalError] = useState('')
  const selectedInquiry = inquiries.find((inquiry) => inquiry.id === selectedId)
  const selectedMessages = messages.filter((message) => message.inquiry_id === selectedId)

  useEffect(() => {
    if (!inquiries.some((inquiry) => inquiry.id === selectedId)) {
      setSelectedId(inquiries[0]?.id ?? null)
      setReply('')
    }
  }, [inquiries, selectedId])

  async function sendReply(event) {
    event.preventDefault()
    if (!selectedInquiry) return
    setBusy(true)
    setLocalError('')
    try {
      await onReply(selectedInquiry.id, reply)
      setReply('')
    } catch (replyError) {
      setLocalError(replyError.message || 'Could not send your reply.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="editor-layout inquiry-admin-layout">
      <aside className="record-list">
        <div className="record-list-heading">
          <div><span className="admin-eyebrow">Visitor messages</span><h2>Inbox · {inquiries.length}</h2></div>
          <button type="button" className="admin-button button-quiet" onClick={onRefresh}>Refresh</button>
        </div>
        {error ? (
          <p className="record-empty">Inbox unavailable. Apply the portfolio inquiries migration, then refresh. {error}</p>
        ) : (
          <div className="record-items">
            {inquiries.map((inquiry) => (
              <button
                type="button"
                className={`record-item ${selectedId === inquiry.id ? 'record-item-active' : ''}`}
                key={inquiry.id}
                onClick={() => { setSelectedId(inquiry.id); setReply(''); setLocalError('') }}
              >
                <span className="record-mark">{inquiry.name.slice(0, 1).toUpperCase()}</span>
                <span className="record-item-copy">
                  <span className="record-item-title">{inquiry.name}</span>
                  <small>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(inquiry.created_at))}</small>
                </span>
              </button>
            ))}
            {!inquiries.length && <p className="record-empty">No active questions. New messages will appear here.</p>}
          </div>
        )}
      </aside>

      <section className="editor-form inquiry-admin-form">
        <div className="editor-form-heading">
          <div><span className="admin-eyebrow">Private conversation</span><h2>{selectedInquiry?.name || 'Select a question'}</h2></div>
        </div>
        {error ? (
          <div className="admin-alert alert-error" role="alert">Apply <code>20261114030000_portfolio_inquiries.sql</code> in Supabase to enable the inbox. {error}</div>
        ) : selectedInquiry ? (
          <>
            <div className="inquiry-admin-contact">
              <a href={`mailto:${selectedInquiry.email}`}>{selectedInquiry.email}</a>
              <span>Auto-deletes {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(selectedInquiry.expires_at))}</span>
            </div>
            {localError && <div className="admin-alert alert-error" role="alert">{localError}</div>}
            <div className="inquiry-admin-messages">
              {selectedMessages.map((message) => (
                <article className={`inquiry-admin-message ${message.sender}`} key={message.id}>
                  <div><strong>{message.sender === 'admin' ? 'You' : selectedInquiry.name}</strong><time dateTime={message.created_at}>{new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(message.created_at))}</time></div>
                  <p>{message.body}</p>
                </article>
              ))}
            </div>
            <form onSubmit={sendReply}>
              <label className="admin-field">Reply
                <textarea rows={4} maxLength={4000} value={reply} onChange={(event) => setReply(event.target.value)} required />
              </label>
              <div className="editor-actions">
                <button className="admin-button button-accent" type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send reply'}</button>
              </div>
              <p className="field-hint">The visitor can see your reply from their private ticket on the portfolio. No email notification is sent.</p>
            </form>
          </>
        ) : !error ? (
          <p className="record-empty">Choose an active question to read and reply.</p>
        ) : null}
      </section>
    </div>
  )
}
