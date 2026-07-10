# BhejDo - Bug Report

## Critical (app-breaking)

1. **[BUG-001] Profile page does not exist - clicking Profile link leads to blank/404**
   - File: `frontend/src/components/Navbar.tsx` (lines 115-122, 214-220)
   - The Navbar has `<Link to="/profile">` for both desktop dropdown and mobile menu
   - File: `frontend/src/App.tsx` — No `/profile` route is defined
   - No `Profile.tsx` page component exists anywhere in the codebase
   - **Expected:** Clicking Profile navigates to a working profile page
   - **Actual:** Navigates to `/profile` which matches no route, renders blank page

2. **[BUG-002] Notifications page does not exist - clicking notification bell link leads to blank/404**
   - File: `frontend/src/components/Navbar.tsx` (lines 91-94, 195-202)
   - The Navbar has `<Link to="/notifications">` for both desktop and mobile
   - File: `frontend/src/App.tsx` — No `/notifications` route is defined
   - No `Notifications.tsx` page component exists
   - **Expected:** Clicking the notification bell/link navigates to a notifications page
   - **Actual:** Navigates to `/notifications` which matches no route, renders blank page
   - **Note:** The `NotificationBell.tsx` component exists but is never used in the Navbar (Navbar renders its own `<Link to="/notifications">` instead of the dropdown component)

3. **[BUG-003] Traveler Dashboard shows no available jobs after sender creates a delivery - data flow broken**
   - File: `frontend/src/pages/dashboard/TravelerDashboard.tsx` (lines 35-38)
   - The Traveler Dashboard fetches from `GET /api/assignments?status=PENDING` to populate "Available Jobs"
   - However, when a sender creates a parcel (`POST /api/parcels`), the parcel is created with status `CREATED` but NO assignment is created
   - Assignments are only created when a sender manually calls `POST /api/matching/assign` (which requires finding trips first via `POST /api/matching/find`)
   - There is NO auto-matching mechanism and NO UI in the Sender Dashboard to trigger matching
   - **Expected:** After sender creates a parcel, it should appear as an available job for travelers
   - **Actual:** The parcel exists but no assignment exists, so Traveler Dashboard shows nothing. The `GET /api/assignments?status=PENDING` returns only assignments that were manually created via the matching API, which has no UI trigger.

4. **[BUG-004] CreateShipment page is accessible by ALL authenticated roles including Traveler, Agent, Admin**
   - File: `frontend/src/App.tsx` (lines 46-49)
   - Route `/shipment/create` is wrapped in `<ProtectedRoute allowedRoles={['SENDER', 'TRAVELER', 'AGENT', 'ADMIN']} />`
   - However, the backend `POST /api/parcels` has `roleCheck('SENDER')` — only SENDER can create parcels
   - **Expected:** Only SENDER role should access `/shipment/create`
   - **Actual:** All roles can access the page, but Traveler/Agent/Admin will get a 403 error from the API when they submit the form. The frontend should block access entirely.

## High (wrong behavior)

5. **[BUG-005] "Send a Parcel" button on Landing page navigates unauthenticated users to /shipment/create which then redirects to /login**
   - File: `frontend/src/pages/Landing.tsx` (lines 86-89, 237-240)
   - Hero CTA: `<Link to="/shipment/create">Send a Parcel</Link>`
   - CTA Section: `<Link to="/shipment/create">Send Your First Parcel</Link>`
   - Since `/shipment/create` is protected, unauthenticated users get redirected to `/login`
   - After login, there is NO redirect-back mechanism — the user ends up on their dashboard, not on `/shipment/create`
   - **Expected:** Either link directly to `/login?redirect=/shipment/create` or check auth status before navigating
   - **Actual:** User clicks "Send a Parcel" -> goes to /shipment/create -> gets redirected to /login -> logs in -> ends up on dashboard (loses the intent to create a shipment)

6. **[BUG-006] Navbar "How It Works" link uses hash navigation `/#how-it-works` which doesn't work with React Router**
   - File: `frontend/src/components/Navbar.tsx` (line 10)
   - `{ label: 'How It Works', to: '/#how-it-works' }`
   - React Router's `<Link>` component treats this as a route path, not an anchor
   - When on the landing page, clicking this does a navigation to `/#how-it-works` which re-renders the page but may not scroll to the section
   - When on any other page, it navigates to landing but doesn't scroll to the section
   - **Expected:** Smooth scroll to `#how-it-works` section on landing page
   - **Actual:** Inconsistent behavior; does not reliably scroll to the target section

7. **[BUG-007] Agent Dashboard OTP verification does not actually validate the OTP — backend requires ACCEPTED state but agent shows PENDING parcels**
   - File: `frontend/src/pages/dashboard/AgentDashboard.tsx` (lines 62, 73-89)
   - Agent fetches assignments filtered by `['PENDING', 'ACCEPTED', 'PICKED_UP']` statuses
   - `handleConfirmPickup` calls `PATCH /assignments/:id/pickup` which requires `assignment.status === 'ACCEPTED'`
   - If the assignment is still `PENDING`, the pickup will fail with "Assignment must be in ACCEPTED state"
   - The OTP entered by the agent is collected in state (`otpInputs`) but NEVER sent to the backend — the `PATCH /assignments/:id/pickup` endpoint does not accept or validate OTP
   - **Expected:** OTP should be sent to backend and validated during pickup confirmation
   - **Actual:** OTP field is decorative only; pickup API does not receive or check it

8. **[BUG-008] Agent's "Transfer to Traveler" button calls `/assignments/:id/transit` which requires TRAVELER role — Agent gets 403**
   - File: `frontend/src/pages/dashboard/AgentDashboard.tsx` (line 97)
   - `handleTransfer` calls `api.patch('/assignments/${assignmentId}/transit')`
   - File: `backend/routes/assignments.js` (line 127) — `roleCheck('TRAVELER', 'ADMIN')`
   - The transit endpoint only allows TRAVELER or ADMIN, not AGENT
   - **Expected:** Agent should be able to transfer parcel to traveler (or this button should not exist for agents)
   - **Actual:** Agent clicks "Transfer to Traveler" and gets a 403 Forbidden error

9. **[BUG-009] Admin Panel "View" link for parcels uses wrong URL pattern `/tracking/:code` instead of `/track/:code`**
   - File: `frontend/src/pages/admin/AdminPanel.tsx` (line 593)
   - `<a href="/tracking/${parcel.trackingCode}">View</a>`
   - File: `frontend/src/App.tsx` — The route is `/track/:code`, not `/tracking/:code`
   - Also uses `<a href>` instead of React Router `<Link>`, causing full page reload
   - **Expected:** Links to `/track/${parcel.trackingCode}` using React Router Link
   - **Actual:** Links to non-existent route `/tracking/...`, resulting in blank page

10. **[BUG-010] Wallet page "Add Money" and "Transfer" buttons have no functionality**
    - File: `frontend/src/pages/Wallet.tsx` (lines 226-233)
    - "Add Money" button: `<button>` with no `onClick` handler — does nothing
    - "Transfer" button: `<button>` with no `onClick` handler — does nothing
    - **Expected:** Buttons should either open a modal/form or be visually disabled/marked as "coming soon"
    - **Actual:** Buttons appear fully interactive but do absolutely nothing when clicked

11. **[BUG-011] "Forgot Password" link on Login page leads to non-existent route**
    - File: `frontend/src/pages/Login.tsx` (lines 186-190)
    - `<Link to="/forgot-password">Forgot password?</Link>`
    - No `/forgot-password` route exists in `App.tsx`, no ForgotPassword component exists
    - **Expected:** Either a working forgot password page or the link should be removed/disabled
    - **Actual:** Navigates to blank page

## Medium (missing features / incomplete behavior)

12. **[BUG-012] No auto-matching between sender parcels and traveler trips — matching is completely manual but no UI exists to trigger it**
    - Backend has `POST /api/matching/find` and `POST /api/matching/assign` endpoints
    - Neither the Sender Dashboard nor any other page has UI to browse available travelers or trigger matching
    - File: `frontend/src/pages/dashboard/SenderDashboard.tsx` — No "Find Traveler" or "Match" button
    - **Expected:** After creating a parcel, sender should be able to find/assign travelers, OR auto-matching should happen
    - **Actual:** Parcels remain in CREATED status forever with no way to proceed through the UI

13. **[BUG-013] Traveler has no way to create/register trips via UI**
    - Backend has `POST /api/trips` endpoint for creating trips
    - File: `frontend/src/pages/dashboard/TravelerDashboard.tsx` — No "Create Trip" or "Register Trip" button/form
    - Without trips, matching cannot work (matching requires trips with matching routes)
    - **Expected:** Traveler Dashboard should have a "Create Trip" feature
    - **Actual:** No UI exists to create trips

14. **[BUG-014] NotificationBell component exists but is never rendered — Navbar uses a plain Link instead**
    - File: `frontend/src/components/NotificationBell.tsx` — Full dropdown notification component
    - File: `frontend/src/components/Navbar.tsx` (lines 91-94) — Uses `<Link to="/notifications">` with a static badge indicator
    - The actual NotificationBell component (with real-time unread count and dropdown) is never imported or rendered
    - **Expected:** Navbar should use the NotificationBell dropdown component
    - **Actual:** Navbar renders a dumb link with a hardcoded badge dot

15. **[BUG-015] Navbar notification badge always shows (hardcoded dot) regardless of whether user has unread notifications**
    - File: `frontend/src/components/Navbar.tsx` (line 93)
    - `<span className="absolute -top-1 -right-1 h-3 w-3 bg-orange-500 rounded-full border-2 border-white animate-badge-pulse" />`
    - This is unconditionally rendered — always shows an orange dot
    - **Expected:** Badge should only show when there are unread notifications
    - **Actual:** Always shows, misleading users into thinking they have notifications

16. **[BUG-016] Token refresh not implemented on the frontend — expired tokens cause hard redirect**
    - File: `frontend/src/lib/api.ts` (lines 23-30) — On 401, removes token and does `window.location.href = '/login'`
    - Backend provides refresh tokens and has a `/api/auth/refresh` endpoint
    - Frontend never stores the refresh token, never calls the refresh endpoint
    - **Expected:** Silently refresh token when it expires using the refresh token mechanism
    - **Actual:** After 7 days (token expiry), user is abruptly redirected to login losing any in-progress work

17. **[BUG-017] ParcelDetails page "Share Tracking" button only copies tracking code — does not actually share**
    - File: `frontend/src/pages/ParcelDetails.tsx` (lines 358-363)
    - Button shows `<Share2>` icon and says "Share Tracking" but calls `copyTrackingCode()`
    - This only copies the tracking code to clipboard, it doesn't use Web Share API or generate a shareable link
    - **Expected:** Either use navigator.share() or copy a full tracking URL like `https://bhejdo.com/track/BD-XXXXX`
    - **Actual:** Just copies the raw tracking code text

18. **[BUG-018] "Contact Support" link in ParcelDetails navigates to /track page instead of actual support**
    - File: `frontend/src/pages/ParcelDetails.tsx` (lines 365-370)
    - `<Link to="/track">Contact Support</Link>` with a `<MessageCircle>` icon
    - **Expected:** Should link to an actual support page, email, or chat widget
    - **Actual:** Navigates to the tracking page, which has nothing to do with support

19. **[BUG-019] SenderDashboard destination city uses wrong field name**
    - File: `frontend/src/pages/dashboard/SenderDashboard.tsx` (line 117)
    - `<span className="font-medium">{parcel.destination_city || parcel.receiverCity}</span>`
    - Backend `GET /api/parcels` returns `destination_city` (from the parcels table)
    - But if the field is `destination_city`, the first operand works. However, the fallback `parcel.receiverCity` never exists in the API response (the field is `receiver_city` not `receiverCity`)
    - **Expected:** Fallback should be `parcel.receiver_city`
    - **Actual:** If `destination_city` is somehow missing, shows undefined instead of receiver city

20. **[BUG-020] TravelerDashboard shows `estimatedPrice: 0` for all available jobs**
    - File: `frontend/src/pages/dashboard/TravelerDashboard.tsx` (line 58)
    - `estimatedPrice: 0` is hardcoded for all jobs mapped from assignments
    - The assignment response includes parcel data but `estimated_price` is not fetched from it
    - **Expected:** Should display the actual estimated price from the parcel
    - **Actual:** Always displays "₹0" for every job

21. **[BUG-021] Date filter in TravelerDashboard is collected but never used**
    - File: `frontend/src/pages/dashboard/TravelerDashboard.tsx` (lines 28, 155-159, 81-86)
    - `dateFilter` state is set by the date input but the `filteredJobs` function only filters by `cityFilter`
    - **Expected:** Jobs should be filterable by date
    - **Actual:** Date filter input exists but has no effect on displayed jobs

## Low (UI/UX issues)

22. **[BUG-022] Footer social media links are all `href="#"` — go nowhere**
    - File: `frontend/src/pages/Landing.tsx` (lines 300-308)
    - Twitter, Instagram, LinkedIn links all use `href="#"` which scrolls to top
    - **Expected:** Either link to real social media pages or remove the links
    - **Actual:** Clicking any social icon scrolls user to top of page

23. **[BUG-023] Footer "Company" and "Support" links are all `href="#"` — go nowhere**
    - File: `frontend/src/pages/Landing.tsx` (lines 313-326)
    - About Us, Careers, Press, Blog, Help Center, Safety, Terms of Service, Privacy Policy — all `href="#"`
    - **Expected:** Either link to real pages or mark as "Coming Soon"
    - **Actual:** All scroll to page top

24. **[BUG-024] Copyright year is hardcoded to 2024**
    - File: `frontend/src/pages/Landing.tsx` (line 351)
    - `<p>&copy; 2024 BhejDo. All rights reserved.</p>`
    - **Expected:** Use dynamic year (`new Date().getFullYear()`) or at least show 2025/2026
    - **Actual:** Shows 2024

25. **[BUG-025] TravelerDashboard wallet balance uses `user?.walletBalance` but User type stores it as `wallet_balance`**
    - File: `frontend/src/pages/dashboard/TravelerDashboard.tsx` (line 266)
    - `₹{user?.walletBalance?.toLocaleString() || '0'}`
    - File: `frontend/src/types/index.ts` — User has `wallet_balance: number` and optional alias `walletBalance?: number`
    - The `/api/auth/me` response returns `wallet_balance` (snake_case), not `walletBalance`
    - **Expected:** Should use `user?.wallet_balance`
    - **Actual:** Always shows "₹0" because `walletBalance` is undefined

26. **[BUG-026] ParcelDetails sets `pickupAddress` to the city name instead of actual address**
    - File: `frontend/src/pages/ParcelDetails.tsx` (line 43)
    - `p.pickupAddress = p.pickup_city || '';`
    - The backend parcels table does not store pickup_address, but this mapping aliases the city as the address
    - **Expected:** Should display actual pickup address or leave empty
    - **Actual:** "From" section shows the city name in both the city and address fields

27. **[BUG-027] API base URL is hardcoded to `http://localhost:3001` — will break in production**
    - File: `frontend/src/lib/api.ts` (line 4)
    - `baseURL: 'http://localhost:3001/api'`
    - **Expected:** Use environment variable like `import.meta.env.VITE_API_URL`
    - **Actual:** Hardcoded localhost URL

28. **[BUG-028] Signup allows creating ADMIN accounts - no restriction on admin signup**
    - File: `backend/routes/auth.js` (line 34)
    - Validation accepts role `ADMIN`: `if (!['SENDER', 'TRAVELER', 'AGENT', 'ADMIN'].includes(role))`
    - File: `frontend/src/pages/Signup.tsx` (line 8) — Frontend restricts to `Exclude<UserRole, 'ADMIN'>`
    - However, someone can call the API directly with `role: "ADMIN"` to create admin accounts
    - **Expected:** Backend should reject ADMIN role on signup (only allow via internal/seed)
    - **Actual:** Anyone can create an admin account via API
