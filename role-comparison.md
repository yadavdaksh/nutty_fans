# NuttyFans Role Architecture: User vs. Creator

This document outlines the structural, functional, and navigational differences between the **User** and **Creator** roles on the NuttyFans platform.

---

## 🧭 Navigation Matrix

| Feature | **User (Fan)** | **Creator** |
| :--- | :--- | :--- |
| **Primary Navigation** | **Sidebar** (Fixed Left) | **Top Header** (Sticky Top) |
| **Secondary Navigation** | Bottom Sidebar Links | Header Dropdown |
| **Contextual Nav** | Search in Sidebar | Search in Header |
| **Notifications** | Red dots on Sidebar avatars | Red dot on Header Bell |

---

## 📄 Page Access Control

| Page Path | **User (Fan)** | **Creator** | Purpose |
| :--- | :--- | :--- | :--- |
| `/` (Home) | Personalized Feed | Platform Landing / Overview | Browsing content |
| `/discover` | Search for Creators | Competitive Research | Discovery of talent |
| `/messages` | 1-on-1 Chat UI | Creator Inbox Management | Real-time communication |
| `/dashboard` | **Disabled** (Redirects) | **Primary Hub** (Revenue/Analytics) | Backend management |
| `/profile` | View self (as fan) | View self (as creator/public) | Branding & Bio |
| `/subscription` | Manager Subscribed List | Manage Subscription Tiers | Revenue management |

---

## 🧱 Component Differences

### **Sidebar (Users Only)**
- Fixed width of `276px`.
- Contains: Home, Discover, Messages, Live Stream, Subscriptions.
- Profile info is at the bottom (Logout/Settings).

### **Header (Creators Only)**
- Fixed height of `65px`.
- Contains Logo, and direct nav links: Home, Discover, Messages, Subscription, Live Stream, Dashboard.
- Search and Notifications are integrated into the top-right toolbar.

---

## ⚙️ Functionality Deep-Dive

### **The "Fan" Experience (User)**
- **Paywall Interaction**: Posts appear blurred until a subscription is detected.
- **Support**: Can "Subscribe" to tiers and "Unlock" individual media.
- **Identity**: Profiles focus on follow/subscription counts.

### **The "Creator" Experience**
- **Content Engine**: Has access to "Upload Post" tools and "Content Management" dashboards.
- **Revenue Tools**: Can create and price tiers (Basic, Premium, VIP).
- **Analytics**: Can see "Subscriber Counts" and "Monthly Revenue" (Mocked).

---

> [!NOTE] 
> The application uses `LayoutShell.tsx` to dynamically determine whether to render the Sidebar or Header based on the `userProfile.role`.
