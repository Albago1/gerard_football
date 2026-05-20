// Canonical category list — shared between public frontend and admin dashboard.
// Clips are stored separately (clips.json) and reference a category by its `id`.

export const CATEGORIES = [
  {
    id: "goals",
    label: "Finishing",
    title: "Goals",
    description: "Finishing from range, tight angles, and 1v1 with the keeper.",
  },
  {
    id: "assists",
    label: "Creativity",
    title: "Assists & Chance Creation",
    description: "Link-up play, through balls, and created scoring opportunities.",
  },
  {
    id: "dribbling",
    label: "Technical",
    title: "Dribbling & 1v1",
    description: "Taking on defenders, using pace and technique in tight spaces.",
  },
  {
    id: "pressing",
    label: "Work Rate",
    title: "Pressing & Defensive Work",
    description: "Press triggers, ball recoveries, and defensive contribution.",
  },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];
