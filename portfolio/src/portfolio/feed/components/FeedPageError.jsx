export default function FeedPageError({ message }) {
  if (!message) return null

  return (
    <div className="my-[15px] break-words rounded-[9px] border border-[#603c36] bg-[#2a1e1b] p-[14px] text-[10px] leading-[1.7] text-[#f0aaa1]" role="alert">
      <strong>Couldn’t load the feed.</strong>
      <p className="mb-0 mt-[5px]">{message}</p>
      <p className="mb-0 mt-[5px]">If the feed database is not set up yet, run <code className="text-[#edf2ed]">portfolio/supabase/migrations/20261114050000_portfolio_feed.sql</code> in the Supabase SQL Editor.</p>
    </div>
  )
}
