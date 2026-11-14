import { sitePath } from '../lib/sitePath.js'
import FeedCategoryTabs from './feed/components/FeedCategoryTabs.jsx'
import FeedComposer from './feed/components/FeedComposer.jsx'
import FeedEmptyState from './feed/components/FeedEmptyState.jsx'
import FeedHeader from './feed/components/FeedHeader.jsx'
import FeedIntro from './feed/components/FeedIntro.jsx'
import FeedPageError from './feed/components/FeedPageError.jsx'
import FeedPost from './feed/components/FeedPost.jsx'
import FeedResultsHeading from './feed/components/FeedResultsHeading.jsx'
import FeedSidebar from './feed/components/FeedSidebar.jsx'
import FeedSignInPrompt from './feed/components/FeedSignInPrompt.jsx'
import usePortfolioFeed from './feed/hooks/usePortfolioFeed.js'

export default function FeedPage() {
  const feed = usePortfolioFeed()
  const name = feed.profile?.full_name || 'MD Juel Rana'
  const avatarUrl = feed.profile?.avatar_url || ''
  const pageStyle = {
    '--accent': '#3158c8',
    '--ink': '#edf2ed',
    '--muted': '#a9b5ac',
    '--subtle': '#859188',
    '--line': '#2b3730',
  }

  return (
    <main className="min-h-screen bg-[#111613] px-[clamp(20px,6vw,92px)] text-[#edf2ed] [background-image:radial-gradient(ellipse_at_86%_0%,rgba(63,101,209,0.16),transparent_30%)] [font-family:'DM_Sans',sans-serif] max-[680px]:px-[22px] max-[430px]:px-[17px]" style={pageStyle}>
      <FeedHeader name={name} />
      <FeedIntro />
      <div className="mx-auto grid max-w-[980px] grid-cols-[minmax(280px,320px)_minmax(0,560px)] items-start justify-center gap-[clamp(28px,3vw,40px)] pb-[65px] pr-4 pt-[37px] max-[900px]:grid-cols-[260px_minmax(0,1fr)] max-[900px]:gap-6 max-[680px]:grid-cols-1 max-[680px]:gap-[15px] max-[680px]:pb-[42px] max-[680px]:pr-0 max-[680px]:pt-6">
        <FeedSidebar name={name} avatarUrl={avatarUrl} />
        <section className="min-w-0 scroll-mt-[105px]" id="journal" aria-label="Posts">
          <FeedCategoryTabs filter={feed.filter} onChange={feed.setFilter} postCount={feed.posts.length} />
          {feed.isAdmin ? (
            <FeedComposer
              name={name}
              avatarUrl={avatarUrl}
              category={feed.category}
              mediaType={feed.mediaType}
              title={feed.title}
              body={feed.body}
              mediaUrl={feed.mediaUrl}
              mediaFile={feed.mediaFile}
              formError={feed.formError}
              notice={feed.notice}
              busy={feed.busy}
              onSubmit={feed.publishPost}
              onCategoryChange={feed.changeCategory}
              onMediaTypeChange={feed.changeMediaType}
              onTitleChange={feed.setTitle}
              onBodyChange={feed.setBody}
              onMediaUrlChange={(value) => {
                feed.setMediaUrl(value)
                feed.setMediaFile(null)
              }}
              onMediaFileChange={feed.selectMediaFile}
            />
          ) : (
            <FeedSignInPrompt />
          )}
          <FeedResultsHeading filter={feed.filter} count={feed.filteredPosts.length} loading={feed.loading} />
          <FeedPageError message={feed.pageError} />
          {feed.loading && (
            <div className="flex items-center justify-center gap-2.5 py-[38px] text-xs text-[#a9b5ac]">
              <span className="h-[17px] w-[17px] animate-spin rounded-full border-2 border-white/15 border-t-[#9ab2ff]" />
              Loading the feed…
            </div>
          )}
          {!feed.loading && !feed.pageError && feed.filteredPosts.length === 0 && <FeedEmptyState filter={feed.filter} />}
          {!feed.loading && !feed.pageError && feed.filteredPosts.length > 0 && (
            <div className="grid gap-[13px]">
              {feed.filteredPosts.map((post) => (
                <FeedPost
                  key={post.id}
                  post={post}
                  name={name}
                  avatarUrl={avatarUrl}
                  isAdmin={feed.isAdmin}
                  busy={feed.busy}
                  onDelete={feed.deletePost}
                />
              ))}
            </div>
          )}
        </section>
      </div>
      <footer className="mx-auto flex max-w-[980px] justify-between border-t border-[#2b3730] py-[19px] pr-4 text-[11px] text-[#859188]">
        <span>© {new Date().getFullYear()} {name}</span>
        <a className="text-[#a9b5ac] transition-colors hover:text-[#c1d0ff]" href={sitePath()}>Explore the portfolio <span className="ml-1">↗</span></a>
      </footer>
    </main>
  )
}
