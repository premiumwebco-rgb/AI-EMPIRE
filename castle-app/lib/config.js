// Static UI configuration — room metadata (icon, blurb, which agent) and
// achievement tiers. Unlike tasks/feed/notifications/reports, this isn't
// business state that changes from an event; it's the app's own
// structure, same as it was hard-coded in the old castle. Lives in code
// on purpose, not the database.

export const ROOMS = [
  { id: "throne", icon: "🏰", name: "Throne Room", agent: "Ember", codename: "Master Agent",
    blurb: "Oversees the ecosystem, receives reports, assigns missions, coordinates every agent." },
  { id: "scout", icon: "🔎", name: "Scout Research Tower", agent: "Scout", codename: "Research Agent",
    blurb: "Discoveries, trends, and the niche research board." },
  { id: "design", icon: "🎨", name: "Design Workshop", agent: "Design", codename: "Design Agent",
    blurb: "Concepts, drafts, and design QA approvals." },
  { id: "listing", icon: "📝", name: "Listing Library", agent: "Listing", codename: "Listing Agent",
    blurb: "SEO, keywords, and listing optimization tasks." },
  { id: "marketing", icon: "📣", name: "Marketing Arena", agent: "Marketing", codename: "Marketing Agent",
    blurb: "Campaigns, experiments, and traffic sources." },
  { id: "analytics", icon: "📊", name: "Analytics Observatory", agent: "Tally", codename: "Analytics Agent",
    blurb: "Charts, insights, warnings, and recommendations." }
];

export const AGENT_ICON = { Ember: "👑", Scout: "🔎", Design: "🎨", Listing: "📝", Marketing: "📣", Tally: "📊" };

export const ACHIEVEMENTS = [
  { icon: "🏰", name: "Castle Level 1", desc: "First business launched", threshold: 1 },
  { icon: "⚔️", name: "Merchant Level", desc: "First $1,000 revenue", threshold: 1000 },
  { icon: "👑", name: "Empire Builder", desc: "$10,000 / month", threshold: 10000 },
  { icon: "🌎", name: "Kingdom Expansion", desc: "Multiple profitable businesses", threshold: null }
];
