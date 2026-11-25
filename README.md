# Campusly

Campusly is a front-end campus community prototype built with HTML, CSS and vanilla JavaScript.

## Run locally
1. Extract the ZIP.
2. Open `Campusly/index.html` in a modern browser.
3. Use **Try demo account** on the login screen.

## Included prototype features
- Student sign-in/register flow (browser-only demo)
- Social feed, post composer, image attachments, polls and event posts
- Like, comment, save, share and feed filtering
- Student profile view and editable profile details
- Demo direct messages with conversation search and unread filtering
- Notifications and read-state handling
- Events and clubs panels with join interactions
- Responsive desktop and mobile layouts

## Important
This is a client-side demonstration. Accounts, messages, posts and profile edits are stored in the browser's `localStorage`; they are not synced to a server and authentication is not secure production authentication. Clearing browser data removes locally stored demo data. For a real deployment, connect a backend such as Supabase and implement server-side authentication, authorization and database rules.

## Presentation upgrade (November 2026)
- Expanded the starter feed to seven sample posts with author profile links.
- Added dislike and local report actions, plus a persistent written-comments panel.
- Added event and club detail dialogs with illustrative descriptions, RSVP/join demo actions, and notifications.
- Expanded profile editing with course, interests, avatar URL, and local photo upload.
- Refreshed typography, hover states, modal styling, responsive layouts, and visual hierarchy.
- Added remote Unsplash image links for sample post and event imagery. Internet access is needed to load those images.

### Demo data and limitations
Event dates, attendance actions, club details, notifications, and sample posts are fictional presentation content. Actions are stored in this browser only. This is not a production multi-user system: use a backend such as Supabase for real accounts, shared posts, messaging, uploads, moderation, and server-side security. Do not use real passwords or sensitive student data in this local prototype.

# Assessment build: 5 × 20 marks

## React (20)
The Admin Console is a React 18 module in `js/admin.js`. It uses reusable `AdminStat` and `AdminConsole` components, props, `useState`, and `useMemo`. The rest of the legacy interface remains HTML/CSS/vanilla JavaScript; this project has not been fully migrated to React. React and ReactDOM load from a CDN, so an internet connection is required for the Admin Console.

## Login and sign out (20)
- Demo student: `demo@campusly.com` / `campusly123`
- Demo administrator: `admin@campusly.com` / `Admin@123`
- Registration validates required fields, email shape, password length, matching passwords, duplicate email, and community-guideline acceptance.
- Demo login checks the local demo account list and creates a browser session; sign out clears the session.
- Refresh restores a demo session.

## Admin (20)
The admin-only console includes post review/hide/remove, event publish/unpublish/delete, club activate/suspend/delete, and account role management. Admin navigation is hidden for student sessions and the console checks the current role before opening.

## UI/UX (20)
The build includes responsive admin layouts, role labels, clear status feedback, accessible button labels, empty states, hover/focus states, and consistent modal styling.

## Team collaboration and individual contribution (20)
Use `TEAM_CONTRIBUTIONS_TEMPLATE.md` to record the actual work completed by each teammate. Commit your own work with descriptive Git commits and be ready to explain the modules you changed. Do not claim contributions or commits that did not happen.

## Important security boundary
This remains a front-end classroom demonstration. LocalStorage accounts and passwords are not secure; browser storage can be edited by users. Role checks in JavaScript are not real authorization. Do not use real passwords or private student data. A production system requires server-side authentication, hashed passwords, database-backed roles, and server-enforced permissions (e.g. Supabase Auth + Row Level Security).

## Admin Control Centre & Post Reactions
- The Admin Console is now a full-screen control centre inspired by the SWA CARS admin workspace: persistent left navigation, a fixed top bar, and independently scrolling sidebar/content areas.
- Sections: Overview, Analytics, Posts, Reports, Events, Clubs, Users, Support, Feedback, Activity Log, and Settings.
- Admin actions: hide/restore/remove posts; resolve/dismiss reports; publish/unpublish/delete events; activate/suspend/delete clubs; suspend/reactivate accounts; change demo roles; manage local feature switches.
- Administrative actions are recorded in a local audit log.
- Student posts support six reactions (Like, Love, Haha, Wow, Sad, Angry), one active reaction per account per post, persistent reaction counts, and a list of accounts that selected each reaction.
- Post reports are persisted to the Admin Reports queue. Hidden posts are filtered out of the student feed.
- Demo settings for registration, posts, and comments are enforced in the browser prototype.

### Updated demo usage
Sign in with `admin@campusly.com` / `Admin@123`, then choose **Admin Console** in the left navigation. Sign in with `demo@campusly.com` / `campusly123` to test student reactions and post reporting.

### Limitations
All administration, accounts, reactions, reports, and analytics remain local to one browser profile. The localStorage role check is not secure authorization. Production deployment requires a trusted backend and server-side access policies.

## Logout and usability polish
- Added a confirmation step to sign out from both the main app and Admin Control Centre.
- Centralized logout so it clears the demo session, closes the admin modal, hides admin navigation, restores the login screen, and displays signed-out feedback.
- Added a Back to Campusly action that exits the admin workspace without signing out.
- Added Escape-to-close for the admin modal and Ctrl/Cmd + Shift + A to open it while an administrator is signed in.
- Added a floating Back to Top control that targets the currently active scrolling area.
- Added reaction-picker outside-click dismissal, improved focus-visible states, hover feedback, reduced-motion support, and responsive utility styling.
