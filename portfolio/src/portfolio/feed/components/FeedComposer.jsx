import FeedAvatar from './FeedAvatar.jsx'

const controlClass = 'w-full rounded-lg border border-[#344139] bg-[#111613] px-[11px] py-2.5 text-[11px] text-[#edf2ed] outline-none placeholder:text-[#748178] focus:border-[#9ab2ff] focus:ring-[3px] focus:ring-[#9ab2ff]/[.12]'

export default function FeedComposer({
  name,
  avatarUrl,
  category,
  mediaType,
  title,
  body,
  mediaUrl,
  mediaFile,
  formError,
  notice,
  busy,
  onSubmit,
  onCategoryChange,
  onMediaTypeChange,
  onTitleChange,
  onBodyChange,
  onMediaUrlChange,
  onMediaFileChange,
}) {
  return (
    <form className="mb-[30px] rounded-[14px] border border-[#2b3730] bg-[#171d19] p-[17px] shadow-lg shadow-black/10" onSubmit={onSubmit}>
      <div className="mb-[15px] flex items-center gap-2.5">
        <FeedAvatar name={name} imageUrl={avatarUrl} />
        <div className="grid gap-[3px]"><strong className="text-[11px]">Share a moment</strong><span className="text-[9px] text-[#859188]">What did you learn or make today?</span></div>
        <span className="ml-auto rounded border border-[#34456f] px-[7px] py-[5px] text-[8px] font-bold tracking-[.1em] text-[#9ab2ff]">ADMIN</span>
      </div>
      <label className="sr-only" htmlFor="feed-category">Post category</label>
      <select className={`${controlClass} mb-2`} id="feed-category" value={category} onChange={(event) => onCategoryChange(event.target.value)}>
        <option value="learning">Daily learning</option>
        <option value="article">Article / blog</option>
        <option value="clip">Short clip</option>
      </select>
      <label className="sr-only" htmlFor="feed-title">Post title</label>
      <input className={`${controlClass} mb-2`} id="feed-title" value={title} onChange={(event) => onTitleChange(event.target.value)} placeholder="Give this post a title" maxLength={140} required />
      <label className="sr-only" htmlFor="feed-body">Post content</label>
      <textarea className={`${controlClass} min-h-[84px] resize-y leading-[1.65]`} id="feed-body" rows={4} value={body} onChange={(event) => onBodyChange(event.target.value)} placeholder="Write a little about it…" maxLength={10000} required />
      {category !== 'clip' && (
        <label className="mt-[11px] flex items-center justify-between gap-3 text-[10px] text-[#a9b5ac]">
          Add media
          <select className={`${controlClass} min-w-[125px] w-auto px-2.5 py-2`} value={mediaType} onChange={(event) => onMediaTypeChange(event.target.value)}>
            <option value="">No attachment</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </label>
      )}
      {mediaType && (
        <div className="mt-[11px] grid gap-2 rounded-[9px] border border-dashed border-[#344139] p-3 text-[9px] text-[#a9b5ac]">
          <label htmlFor="feed-media-file">{mediaType === 'video' ? 'Upload a video (MP4, WebM, MOV · max 50 MB)' : 'Upload an image (JPEG, PNG, WebP, GIF · max 10 MB)'}</label>
          <input
            className="w-full text-[9px] text-[#859188] file:mr-[9px] file:cursor-pointer file:rounded-md file:border file:border-[#344139] file:bg-[#1d2520] file:px-[9px] file:py-[7px] file:text-[9px] file:text-[#edf2ed]"
            key={`${mediaType}-${mediaFile?.name || 'empty'}`}
            id="feed-media-file"
            type="file"
            accept={mediaType === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/png,image/webp,image/gif'}
            onChange={(event) => onMediaFileChange(event.target.files?.[0])}
          />
          <label className="mt-[3px]" htmlFor="feed-media-url">Or paste a public {mediaType === 'video' ? 'video' : 'image'} URL</label>
          <input className={`${controlClass} py-2`} id="feed-media-url" type="url" value={mediaUrl} onChange={(event) => onMediaUrlChange(event.target.value)} placeholder="https://…" />
          {mediaFile && <span className="break-all text-[#9ab2ff]">{mediaFile.name}</span>}
        </div>
      )}
      {formError && <p className="mb-0 mt-[11px] break-words rounded-md border border-[#603c36] bg-[#2a1e1b] px-2.5 py-[9px] text-[10px] leading-relaxed text-[#f0aaa1]" role="alert">{formError}</p>}
      {notice && <p className="mb-0 mt-[11px] rounded-md border border-[#34456f] bg-[#202a41] px-2.5 py-[9px] text-[10px] leading-relaxed text-[#c3cee6]" role="status">{notice}</p>}
      <div className="mt-[13px] flex items-center justify-between gap-3 border-t border-[#2b3730] pt-3">
        <span className="text-[9px] text-[#859188]">Sharing as {name}</span>
        <button className="min-h-[35px] rounded-[7px] border border-[#3158c8] bg-[#3158c8] px-[13px] text-[10px] font-bold text-white transition-colors hover:bg-transparent hover:text-[#9ab2ff] disabled:cursor-wait disabled:opacity-65" type="submit" disabled={busy}>{busy ? 'Publishing…' : 'Publish post'} <span className="ml-1.5">↗</span></button>
      </div>
    </form>
  )
}
