import { useMemo, useState } from 'react'
import { requireSupabase } from '../../lib/supabase.js'
import { collections, emptyForm, singleSections, toFormValues } from '../config.js'

function FieldInput({ field, value, onChange, onUpload, uploading }) {
  if (field.type === 'checkbox') {
    return (
      <label className="admin-checkbox">
        <input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(field.key, event.target.checked)} />
        <span>{field.label}</span>
      </label>
    )
  }

  return (
    <label className={`admin-field ${field.multiline || field.upload ? 'field-wide' : ''}`}>
      {field.label}
      {field.upload ? (
        <div className="upload-field">
          {value && <img className="upload-preview" src={value} alt="Current upload preview" />}
          <input type="text" inputMode="url" value={value || ''} onChange={(event) => onChange(field.key, event.target.value)} placeholder="Paste an image URL or upload a file" />
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => onUpload(field.key, event.target.files?.[0])} />
          {uploading && <span className="field-hint">Uploading image…</span>}
        </div>
      ) : field.multiline ? (
        <textarea rows={4} value={value ?? ''} onChange={(event) => onChange(field.key, event.target.value)} required={field.required} />
      ) : field.type === 'color' ? (
        <div className="color-field"><input type="color" value={value || '#3158c8'} onChange={(event) => onChange(field.key, event.target.value)} /><span>{value}</span></div>
      ) : (
        <input type={field.type || 'text'} value={value ?? ''} onChange={(event) => onChange(field.key, event.target.value)} required={field.required} />
      )}
      {field.hint && <span className="field-hint">{field.hint}</span>}
    </label>
  )
}

export default function ContentEditor({ activeTab, content, setContent, onNotice }) {
  const config = collections[activeTab] || singleSections[activeTab]
  const isCollection = Boolean(collections[activeTab])
  const initialRecord = isCollection ? content[activeTab][0] : content[activeTab]
  const [selectedId, setSelectedId] = useState(() => isCollection ? initialRecord?.id ?? null : null)
  const [form, setForm] = useState(() => initialRecord
    ? toFormValues(initialRecord, config.fields)
    : emptyForm(config.fields))
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const rows = useMemo(() => isCollection ? content[activeTab] : [], [content, activeTab, isCollection])

  const selectedLabel = useMemo(() => {
    const row = rows.find((item) => item.id === selectedId)
    return row?.title || row?.name || row?.qualification || row?.platform || ''
  }, [rows, selectedId])

  function startNew() {
    setSelectedId(null)
    setForm(emptyForm(config.fields))
    setError('')
  }

  function selectRecord(row) {
    setSelectedId(row.id)
    setForm(toFormValues(row, config.fields))
    setError('')
  }

  function discardChanges() {
    const selectedRecord = rows.find((row) => row.id === selectedId)
    if (selectedRecord) {
      selectRecord(selectedRecord)
      return
    }

    startNew()
  }

  function changeField(key, value) {
    setForm((previous) => ({ ...previous, [key]: value }))
  }

  async function uploadImage(fieldKey, file) {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      if (!file.type.startsWith('image/')) throw new Error('Choose an image file.')
      if (file.size > 10 * 1024 * 1024) throw new Error('Images must be 10 MB or smaller.')
      const client = requireSupabase()
      const { data: { user } } = await client.auth.getUser()
      if (!user) throw new Error('Your session expired. Sign in again to upload an image.')
      const safeName = file.name.replace(/[^\w.-]+/g, '-')
      const path = `${user.id}/${Date.now()}-${safeName}`
      const { error: uploadError } = await client.storage.from('portfolio-media').upload(path, file, { contentType: file.type })
      if (uploadError) throw uploadError
      const { data } = client.storage.from('portfolio-media').getPublicUrl(path)
      changeField(fieldKey, data.publicUrl)
      onNotice('Image uploaded. Save changes to publish it.')
    } catch (uploadError) {
      setError(uploadError.message || 'Image upload failed.')
    } finally {
      setUploading(false)
    }
  }

  async function save(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    onNotice('')
    try {
      const payload = { ...form }
      if (Object.hasOwn(payload, 'technologies')) {
        payload.technologies = payload.technologies.split(',').map((technology) => technology.trim()).filter(Boolean)
      }
      if (Object.hasOwn(payload, 'sort_order')) payload.sort_order = Number(payload.sort_order) || 0

      const client = requireSupabase()
      let query = client.from(config.table)
      if (isCollection) {
        query = selectedId
          ? query.update(payload).eq('id', selectedId)
          : query.insert(payload)
      } else {
        query = query.update(payload).eq('id', 1)
      }
      const { data, error: saveError } = await query.select().single()
      if (saveError) throw saveError

      if (isCollection) {
        setContent((previous) => ({
          ...previous,
          [activeTab]: selectedId
            ? previous[activeTab].map((row) => row.id === selectedId ? data : row)
            : [...previous[activeTab], data].sort((a, b) => a.sort_order - b.sort_order),
        }))
        setSelectedId(data.id)
      } else {
        setContent((previous) => ({ ...previous, [activeTab]: data }))
        setForm(toFormValues(data, config.fields))
      }
      onNotice(`${config.title} saved successfully.`)
    } catch (saveError) {
      setError(saveError.message || `Could not save ${config.title.toLowerCase()}.`)
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!selectedId || !window.confirm(`Delete "${selectedLabel}"? This cannot be undone.`)) return
    setBusy(true)
    setError('')
    onNotice('')
    try {
      const { error: deleteError } = await requireSupabase().from(config.table).delete().eq('id', selectedId)
      if (deleteError) throw deleteError
      setContent((previous) => ({ ...previous, [activeTab]: previous[activeTab].filter((row) => row.id !== selectedId) }))
      startNew()
      onNotice(`${config.title.slice(0, -1)} deleted.`)
    } catch (deleteError) {
      setError(deleteError.message || `Could not delete ${config.title.toLowerCase()}.`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="editor-layout">
      {isCollection && (
        <aside className="record-list">
          <div className="record-list-heading">
            <div><span className="admin-eyebrow">Content library</span><h2>{config.title}</h2></div>
            <button type="button" className="admin-button button-quiet" onClick={startNew}>+ New</button>
          </div>
          <div className="record-items">
            {rows.map((row) => {
              const label = row.title || row.name || row.qualification || row.platform
              return (
                <button type="button" className={`record-item ${selectedId === row.id ? 'record-item-active' : ''}`} key={row.id} onClick={() => selectRecord(row)}>
                  {row.image_url
                    ? <img className="record-thumbnail" src={row.image_url} alt="" />
                    : <span className="record-mark">{label.slice(0, 1)}</span>}
                  <span className="record-item-copy">
                    <span className="record-item-title">{label}</span>
                    <small>{row.visible === false ? 'Hidden' : 'Published'}</small>
                  </span>
                </button>
              )
            })}
            {!rows.length && <p className="record-empty">No entries yet. Add your first one.</p>}
          </div>
        </aside>
      )}

      <form className="editor-form" onSubmit={save}>
        <div className="editor-form-heading">
          <div><span className="admin-eyebrow">{isCollection ? selectedId ? 'Edit entry' : 'New entry' : 'Single record'}</span><h2>{isCollection ? selectedLabel || `New ${config.title.slice(0, -1).toLowerCase()}` : config.title}</h2></div>
          {selectedId && <button className="admin-button button-danger" type="button" onClick={remove} disabled={busy}>Delete</button>}
        </div>
        {error && <div className="admin-alert alert-error" role="alert">{error}</div>}
        <div className="editor-fields">
          {config.fields.map((field) => (
            <FieldInput key={field.key} field={field} value={form[field.key]} onChange={changeField} onUpload={uploadImage} uploading={uploading} />
          ))}
        </div>
        <div className="editor-actions">
          <button className="admin-button button-accent" type="submit" disabled={busy || uploading}>{busy ? 'Saving…' : 'Save changes'}</button>
          {isCollection && <button className="admin-button button-quiet" type="button" onClick={discardChanges}>{selectedId ? 'Discard changes' : 'Clear form'}</button>}
        </div>
      </form>
    </div>
  )
}
