# Portfolio database and admin setup

The portfolio uses Supabase Postgres, Supabase Auth, and Supabase Storage. The migrations in `supabase/migrations/` create the CMS schema, row-level security policies, a public `portfolio-media` image bucket, starter content matching the existing portfolio, and privacy-conscious daily page-view totals.

## Table design

| Table | Contents | Public access |
| --- | --- | --- |
| `portfolio_profile` | Name, role, contact details, avatar, biography, availability, resume link (one row, `id = 1`) | Read |
| `portfolio_site_settings` | Site title, tagline, and accent color (one row, `id = 1`) | Read |
| `portfolio_skills` | Skill name, category, icon URL, order, and visibility | Visible rows |
| `portfolio_education` | Dates, qualification, institution, description, order, and visibility | Visible rows |
| `portfolio_projects` | Project copy, image, technology tags, link, featured state, order, and visibility | Visible rows |
| `portfolio_social_links` | Social platform, label, URL, order, and visibility | Visible rows |
| `portfolio_admins` | Auth user IDs allowed to manage this portfolio | Admin can read own row |
| `portfolio_analytics_daily` | Anonymous daily profile page-view totals; stores no visitor IDs or IP addresses | Admin read; public can increment and read the aggregate through fixed RPCs |
| `portfolio_inquiries` | Visitor name, email, private ticket token, and 7-day expiration | Admin read; public submission and ticket lookup only through validated RPCs |
| `portfolio_inquiry_messages` | Visitor questions and admin replies linked to an inquiry | Admin read; public replies available only with the matching private ticket token |

`portfolio_admins` is the authorization source; there is no public admin registration. Policies allow visitors to read published content and allow only explicitly enrolled users to manage content and upload images. Never put a Supabase `service_role` key in the browser or in a `VITE_` variable.

## Connect a Supabase project

1. Create a Supabase project and run the SQL files in `supabase/migrations/` in filename order in its SQL Editor (or apply them with the Supabase CLI). If the CMS migration is already applied, apply any newer migrations that have not been run. The inquiries migration enables `pg_cron` and schedules expired-message cleanup every 15 minutes; the latest skills migration replaces the technology entries with the supplied Shields.io badges.
2. In **Authentication → Users**, create the admin account with an email and password.
3. Enroll that account from the SQL Editor:

   ```sql
   insert into public.portfolio_admins (user_id)
   select id from auth.users where email = 'you@example.com'
   on conflict (user_id) do nothing;
   ```

4. Copy the project URL and publishable key into `portfolio/.env` using the keys in `.env.example`.
5. Run `npm run start` in `portfolio`; sign in at `/admin`. The dashboard edits the public portfolio, uploads project/profile images, shows visitor analytics, and provides an inbox for replying to questions.

The analytics counter records one page view per browser tab session, so reloading the same tab does not increment it again. It counts page views rather than unique people, does not identify visitors, and does not filter automated traffic.

Visitors can ask a question without creating an account. Each conversation is accessible with a random private ticket token retained in that browser; visitors can copy the token to check their replies elsewhere. The public page checks for replies periodically. Questions and replies stop being accessible exactly 7 days after submission, then the scheduled job physically deletes the conversation and its messages within 15 minutes. Email addresses are stored for the admin's reference, but this app does not send email notifications.

The public “Let's talk” button opens WhatsApp using the phone number in **Admin → Profile**. Enter international format with a country code; Bangladesh numbers entered locally are normalized automatically. If the phone field is empty, the button falls back to email.

Only a Supabase publishable key belongs in frontend configuration. Supabase Auth passwords and admin membership are managed in Supabase; do not add a service-role key to this app.

Manage the public technology gallery from **Admin → Skills & tools**. Add one item per technology, paste a direct public icon URL or a Shields.io badge URL/Markdown image, set its category and display order, and mark it visible. Shields.io badges display at full size; regular icon URLs display beside the technology name. The gallery uses the existing `portfolio_skills.icon_url` column; the latest migration updates its content without changing the table schema.
