import { useEffect, useState } from 'react'
import {
  fetchPortfolioInquiry,
  submitPortfolioInquiry,
} from '../lib/supabase.js'
import { getInquiryErrorMessage } from './content.js'

const inquiryTokenKey = 'portfolio-inquiry-token'

function readInquiryToken() {
  try {
    return window.localStorage.getItem(inquiryTokenKey) || ''
  } catch (storageError) {
    console.error('Could not read the inquiry ticket from local storage:', storageError)
    return ''
  }
}

function createInquiryToken() {
  const bytes = window.crypto.getRandomValues(new Uint8Array(32))
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export default function usePortfolioInquiry() {
  const [ticketToken, setTicketToken] = useState(readInquiryToken)
  const [inquiryRefresh, setInquiryRefresh] = useState(0)
  const [inquiry, setInquiry] = useState(null)
  const [inquiryLoading, setInquiryLoading] = useState(() => Boolean(readInquiryToken()))
  const [inquiryBusy, setInquiryBusy] = useState(false)
  const [inquiryError, setInquiryError] = useState('')
  const [inquiryNotice, setInquiryNotice] = useState('')
  const [questionName, setQuestionName] = useState('')
  const [questionEmail, setQuestionEmail] = useState('')
  const [questionBody, setQuestionBody] = useState('')
  const [ticketLookup, setTicketLookup] = useState('')

  useEffect(() => {
    if (!ticketToken) {
      setInquiry(null)
      setInquiryLoading(false)
      return undefined
    }

    let active = true
    async function refreshInquiry() {
      setInquiryLoading(true)
      try {
        const result = await fetchPortfolioInquiry(ticketToken)
        if (!active) return
        if (!result) {
          setInquiry(null)
          setTicketToken('')
          setInquiryNotice('This question ticket has expired or is no longer available.')
          try {
            window.localStorage.removeItem(inquiryTokenKey)
          } catch (storageError) {
            console.error('Could not clear expired inquiry ticket:', storageError)
          }
          return
        }
        setInquiry(result)
        setInquiryError('')
      } catch (loadError) {
        if (active) setInquiryError(getInquiryErrorMessage(loadError, 'Could not load your question ticket.'))
      } finally {
        if (active) setInquiryLoading(false)
      }
    }

    refreshInquiry()
    const refreshTimer = window.setInterval(refreshInquiry, 30000)
    return () => {
      active = false
      window.clearInterval(refreshTimer)
    }
  }, [ticketToken, inquiryRefresh])

  async function sendQuestion(event) {
    event.preventDefault()
    setInquiryBusy(true)
    setInquiryError('')
    setInquiryNotice('')
    try {
      const accessToken = createInquiryToken()
      await submitPortfolioInquiry({
        name: questionName,
        email: questionEmail,
        body: questionBody,
        accessToken,
      })
      setInquiryLoading(true)
      setTicketToken(accessToken)
      try {
        window.localStorage.setItem(inquiryTokenKey, accessToken)
      } catch (storageError) {
        console.error('Could not save inquiry ticket in this browser:', storageError)
        setInquiryNotice('Your question was sent. Save the private ticket shown below to check for a reply.')
      }
      setQuestionBody('')
      setInquiryNotice((notice) => notice || 'Your question was sent. Replies will appear here for 7 days.')
    } catch (submitError) {
      setInquiryError(getInquiryErrorMessage(submitError, 'Could not send your question.'))
    } finally {
      setInquiryBusy(false)
    }
  }

  async function copyTicket() {
    try {
      await navigator.clipboard.writeText(ticketToken)
      setInquiryNotice('Private ticket copied.')
    } catch (copyError) {
      console.error('Could not copy inquiry ticket:', copyError)
      setInquiryNotice('Copy is unavailable. Select and copy the ticket text manually.')
    }
  }

  function openTicket() {
    const token = ticketLookup.trim()
    if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
      setInquiryError('Enter the 43-character private ticket you received.')
      return
    }

    setInquiryError('')
    setInquiryNotice('')
    setInquiryLoading(true)
    setTicketToken(token)
    setInquiryRefresh((refresh) => refresh + 1)
    try {
      window.localStorage.setItem(inquiryTokenKey, token)
    } catch (storageError) {
      console.error('Could not save inquiry ticket in this browser:', storageError)
    }
  }

  function startNewQuestion() {
    setTicketToken('')
    setInquiry(null)
    setInquiryError('')
    setInquiryNotice('')
    try {
      window.localStorage.removeItem(inquiryTokenKey)
    } catch (storageError) {
      console.error('Could not clear the previous inquiry ticket:', storageError)
    }
  }

  return {
    ticketToken,
    inquiry,
    inquiryLoading,
    inquiryBusy,
    inquiryError,
    inquiryNotice,
    questionName,
    setQuestionName,
    questionEmail,
    setQuestionEmail,
    questionBody,
    setQuestionBody,
    ticketLookup,
    setTicketLookup,
    sendQuestion,
    copyTicket,
    openTicket,
    startNewQuestion,
  }
}
