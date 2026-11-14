import { useEffect, useMemo, useState } from 'react'
import { requireSupabase, supabase, supabaseSetupMessage } from '../../../lib/supabase.js'
import {
  allowedImageTypes,
  allowedVideoTypes,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  safeHttpUrl,
} from '../feedUtils.js'

const feedFields = 'id,category,title,body,media_type,media_url,media_path,created_at'

export default function usePortfolioFeed() {
  const [posts, setPosts] = useState([])
  const [profile, setProfile] = useState(null)
  const [filter, setFilter] = useState('all')
  const [session, setSession] = useState(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminError, setAdminError] = useState('')
  const [pageError, setPageError] = useState('')
  const [formError, setFormError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [category, setCategory] = useState('learning')
  const [mediaType, setMediaType] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaFile, setMediaFile] = useState(null)

  useEffect(() => {
    if (!supabase) {
      setPageError(supabaseSetupMessage)
      setLoading(false)
      setSessionReady(true)
      return undefined
    }

    let active = true
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setSessionReady(true)
    })

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return
      if (error) setAdminError(error.message)
      setSession(data.session)
      setSessionReady(true)
    }).catch((error) => {
      if (active) {
        setAdminError(error.message || 'Could not restore your sign-in session.')
        setSessionReady(true)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let active = true
    if (!session) {
      setIsAdmin(false)
      setAdminError('')
      return undefined
    }

    requireSupabase().from('portfolio_admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) throw error
        setIsAdmin(Boolean(data))
        setAdminError('')
      })
      .catch((error) => {
        if (active) {
          setIsAdmin(false)
          setAdminError(error.message || 'Could not verify portfolio administrator access.')
        }
      })

    return () => { active = false }
  }, [session])

  useEffect(() => {
    let active = true

    async function loadFeed() {
      setLoading(true)
      setPageError('')
      try {
        const client = requireSupabase()
        const [feedResult, profileResult] = await Promise.all([
          client.from('portfolio_feed_posts').select(feedFields).eq('visible', true).order('created_at', { ascending: false }),
          client.from('portfolio_profile').select('full_name,avatar_url').eq('id', 1).single(),
        ])
        if (feedResult.error) throw feedResult.error
        if (profileResult.error) throw profileResult.error
        if (active) {
          setPosts(feedResult.data || [])
          setProfile(profileResult.data)
        }
      } catch (error) {
        if (active) setPageError(error.message || 'Could not load the feed.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadFeed()
    return () => { active = false }
  }, [])

  const filteredPosts = useMemo(
    () => filter === 'all' ? posts : posts.filter((post) => post.category === filter),
    [posts, filter],
  )

  function resetAttachment() {
    setMediaFile(null)
    setMediaUrl('')
    setFormError('')
  }

  function changeCategory(value) {
    setCategory(value)
    setMediaType(value === 'clip' ? 'video' : '')
    resetAttachment()
  }

  function changeMediaType(value) {
    setMediaType(value)
    resetAttachment()
  }

  function selectMediaFile(file) {
    setMediaFile(file || null)
    setMediaUrl('')
    setFormError('')
  }

  async function publishPost(event) {
    event.preventDefault()
    if (!isAdmin) {
      setFormError('Sign in with a portfolio administrator account to publish.')
      return
    }

    setBusy(true)
    setFormError('')
    setNotice('')
    let uploadedPath = ''
    let client
    try {
      client = requireSupabase()
      let finalMediaUrl = ''
      if (mediaFile) {
        const allowedTypes = mediaType === 'video' ? allowedVideoTypes : allowedImageTypes
        const maxSize = mediaType === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE
        if (!allowedTypes.includes(mediaFile.type)) {
          throw new Error(mediaType === 'video' ? 'Choose an MP4, WebM, or MOV video.' : 'Choose a JPEG, PNG, WebP, or GIF image.')
        }
        if (mediaFile.size > maxSize) {
          throw new Error(mediaType === 'video' ? 'Videos must be 50 MB or smaller.' : 'Images must be 10 MB or smaller.')
        }
        const safeName = mediaFile.name.replace(/[^\w.-]+/g, '-')
        const path = `${session.user.id}/feed/${Date.now()}-${safeName}`
        const { error: uploadError } = await client.storage.from('portfolio-media').upload(path, mediaFile, { contentType: mediaFile.type })
        if (uploadError) throw uploadError
        uploadedPath = path
        finalMediaUrl = client.storage.from('portfolio-media').getPublicUrl(path).data.publicUrl
      } else if (mediaType) {
        finalMediaUrl = safeHttpUrl(mediaUrl)
        if (!finalMediaUrl) throw new Error('Enter a valid http or https media URL, or choose a file to upload.')
      }

      const { data, error } = await client.from('portfolio_feed_posts').insert({
        category,
        title: title.trim(),
        body: body.trim(),
        media_type: mediaType || null,
        media_url: finalMediaUrl,
        media_path: uploadedPath || null,
      }).select(feedFields).single()
      if (error) throw error
      setPosts((previous) => [data, ...previous])
      setTitle('')
      setBody('')
      setMediaUrl('')
      setMediaFile(null)
      setNotice('Your post is live.')
    } catch (error) {
      if (uploadedPath && client) {
        const { error: cleanupError } = await client.storage.from('portfolio-media').remove([uploadedPath])
        if (cleanupError) {
          setFormError(`${error.message || 'Could not publish your post.'} The uploaded file could not be cleaned up: ${cleanupError.message}`)
          return
        }
      }
      setFormError(error.message || 'Could not publish your post.')
    } finally {
      setBusy(false)
    }
  }

  async function deletePost(post) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    setFormError('')
    setNotice('')
    setBusy(true)
    try {
      const client = requireSupabase()
      const { error } = await client.from('portfolio_feed_posts').delete().eq('id', post.id)
      if (error) throw error
      setPosts((previous) => previous.filter(({ id }) => id !== post.id))
      if (post.media_path) {
        const { error: cleanupError } = await client.storage.from('portfolio-media').remove([post.media_path])
        setNotice(cleanupError
          ? `Post deleted, but its uploaded media could not be removed: ${cleanupError.message}`
          : 'Post deleted.')
      } else {
        setNotice('Post deleted.')
      }
    } catch (error) {
      setFormError(error.message || 'Could not delete the post.')
    } finally {
      setBusy(false)
    }
  }

  return {
    posts,
    profile,
    filter,
    setFilter,
    session,
    sessionReady,
    isAdmin,
    adminError,
    pageError,
    formError,
    setFormError,
    notice,
    loading,
    busy,
    category,
    mediaType,
    title,
    setTitle,
    body,
    setBody,
    mediaUrl,
    setMediaUrl,
    mediaFile,
    setMediaFile,
    filteredPosts,
    changeCategory,
    changeMediaType,
    selectMediaFile,
    publishPost,
    deletePost,
  }
}
