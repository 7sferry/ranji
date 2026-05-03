# Ranji - Family Tree Web App

## Overview

A responsive, single-page family tree web application built with Bun, React, and TypeScript. Users can create, view, and manage multiple family trees with an intuitive visual interface. All data persists in localStorage as JSON, with import/export capabilities.

---

## Tech Stack

- **Runtime**: Bun with `Bun.serve()` and HTML imports
- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS (dark/light mode via class strategy)
- **Storage**: localStorage (JSON)
- **No external dependencies** for state management (React context + useReducer)

---

## Data Model

```ts
interface Person {
  id: string;           // crypto.randomUUID()
  firstName: string;
  lastName: string;
  nickname?: string;
  gender: "male" | "female" | "other";
  birthDate?: string;   // ISO date
  deathDate?: string;   // ISO date
  photo?: string;       // base64 data URL (optional, kept small)
  notes?: string;
}

interface Relationship {
  id: string;
  type: "parent-child" | "spouse";
  fromPersonId: string; // parent or spouse A
  toPersonId: string;   // child or spouse B
}

interface FamilyTree {
  id: string;
  name: string;
  description?: string;
  createdAt: string;    // ISO datetime
  updatedAt: string;    // ISO datetime
  persons: Person[];
  relationships: Relationship[];
}

// Root storage shape
interface AppData {
  version: 1;
  trees: FamilyTree[];
  settings: {
    theme: "light" | "dark";
    lastOpenedTreeId?: string;
  };
}
```

**localStorage key**: `ranji_data`

---

## Pages & Layout

### Global Layout

- **Top navbar** (sticky):
  - Left: App logo/name "Ranji"
  - Center: Current tree name (when viewing a tree) with dropdown to switch trees
  - Right: Theme toggle (sun/moon icon), Import/Export menu
- **Content area** below navbar
- Fully responsive: works on mobile (360px+), tablet, and desktop

### 1. Home / Tree List Page (`/`)

The landing page when no tree is selected or when the user wants to manage trees.

- **Header**: "Your Family Trees" with a prominent "+ New Tree" button
- **Tree cards** in a responsive grid (1 col mobile, 2 col tablet, 3 col desktop):
  - Tree name
  - Member count
  - Last updated date
  - Actions: Open, Rename, Delete (with confirmation dialog)
- **Empty state**: Friendly illustration/message with "Create your first family tree" CTA
- Clicking a tree card opens it

### 2. Tree View Page (`/tree/:id`)

The main workspace for a single family tree. Two view modes:

#### a) Visual Tree View (default)

- **Canvas/viewport** with pan (drag) and zoom (scroll/pinch) support
- Persons rendered as **cards/nodes**:
  - Photo placeholder (colored circle with initials if no photo)
  - Full name
  - Birth year - death year (if applicable)
  - Gender indicated by subtle border color (blue/pink/gray)
- **Relationship lines**:
  - Solid lines for parent-child (vertical)
  - Dashed lines for spouse (horizontal)
- **Layout algorithm**: Top-down hierarchical
  - Oldest generation at top
  - Spouses placed side-by-side
  - Children centered below parents
- **Toolbar** (floating, bottom or top of canvas):
  - "+ Add Person" button (primary, prominent)
  - Zoom in / Zoom out / Fit to screen
  - Toggle to list view
  - Search people (filter/highlight)

#### b) List View

- Sortable table/list of all persons in the tree
- Columns: Name, Gender, Birth Date, Death Date, Parents, Spouse(s), Children
- Click a row to open person detail panel
- "+ Add Person" button here too
- Search/filter bar at top

### 3. Person Detail Panel (Slide-over / Modal)

Opens when clicking a person node or list row.

- **View mode** (default):
  - Photo (or initial avatar)
  - Full name, nickname
  - Gender, birth date, death date
  - Notes
  - Relationships section:
    - Parents (clickable links)
    - Spouse(s) (clickable links)
    - Children (clickable links)
  - Edit button, Delete button
- **Edit mode**:
  - Form fields for all Person properties
  - Photo upload (resized to max 200x200, stored as base64)
  - Relationship management:
    - "Add Parent" - dropdown/search of existing persons
    - "Add Spouse" - dropdown/search of existing persons
    - "Add Child" - dropdown/search of existing persons or create new
    - Remove relationship (with confirmation)
  - Save / Cancel buttons

---

## Key Features

### Add Person Flow

1. User clicks "+ Add Person" button (visible in both tree and list views)
2. Modal opens with the person form (firstName, lastName required; rest optional)
3. Optionally link relationships immediately (select existing parent/spouse)
4. On save: person is added to the tree, canvas re-renders with the new node
5. If no relationships are set, the person appears as a standalone node

### Multiple Tree Management

- Create new trees with a name and optional description
- Switch between trees via the navbar dropdown
- Each tree is fully independent
- Delete a tree (with "Are you sure?" confirmation)

### Import / Export

- **Export**:
  - "Export Current Tree" - downloads a single `FamilyTree` as `.json`
  - "Export All Data" - downloads the full `AppData` as `.json`
  - Filename format: `ranji-{tree-name}-{date}.json` or `ranji-backup-{date}.json`
- **Import**:
  - Accept `.json` file via file picker or drag-and-drop
  - Validate JSON structure before importing
  - Options:
    - "Import as new tree" - adds alongside existing trees
    - "Replace all data" - overwrites everything (with warning)
  - Show validation errors if JSON is malformed or has wrong schema

### Dark / Light Mode

- Toggle button in navbar (sun icon for light, moon icon for dark)
- Persisted in `settings.theme`
- Uses Tailwind's `dark:` variant with class strategy on `<html>`
- Default: follow system preference on first visit

### Search

- Search bar in tree view filters/highlights matching person nodes
- Matches against firstName, lastName, nickname
- In visual view: non-matching nodes fade out, matching nodes highlight
- In list view: standard filter

---

## UI Design Direction

### Style

- **Clean, minimal, modern** - similar to Notion or Linear aesthetic
- Rounded corners (lg), subtle shadows
- Smooth transitions and micro-animations (panel slides, node hover effects)
- Sans-serif font (system font stack or Inter)

### Color Palette

| Token          | Light Mode       | Dark Mode        |
|----------------|------------------|------------------|
| Background     | `#FAFAFA`        | `#0F0F0F`        |
| Surface        | `#FFFFFF`        | `#1A1A1A`        |
| Surface hover  | `#F5F5F5`        | `#252525`        |
| Border         | `#E5E5E5`        | `#2E2E2E`        |
| Text primary   | `#171717`        | `#EDEDED`        |
| Text secondary | `#737373`        | `#A3A3A3`        |
| Accent         | `#6366F1` (indigo) | `#818CF8`      |
| Danger         | `#EF4444`        | `#F87171`        |
| Male indicator | `#3B82F6`        | `#60A5FA`        |
| Female indicator | `#EC4899`      | `#F472B6`        |

### Responsive Breakpoints

- Mobile: < 640px (single column, bottom sheet panels, compact nodes)
- Tablet: 640px - 1024px (two columns, side panel)
- Desktop: > 1024px (full layout, side panel)

### Tree Node Design

```
+-------------------------+
|  [Avatar]               |
|  First Last             |
|  1950 - 2020            |
+-------------------------+
```

- 160px wide on desktop, 120px on mobile
- Hover: slight elevation + accent border
- Selected: accent border + highlighted background
- Click: opens detail panel

---

## Interaction Details

- **Pan canvas**: click and drag on empty space (cursor: grab/grabbing)
- **Zoom**: mouse scroll wheel or pinch gesture; zoom controls in toolbar
- **Select person**: click on node
- **Connect people**: through the person detail panel relationship section (not drag-and-drop, to keep it simple)
- **Keyboard shortcuts**:
  - `N` - new person
  - `Escape` - close panel/modal
  - `Ctrl/Cmd + F` - focus search
  - `Ctrl/Cmd + E` - export current tree

---

## Constraints & Considerations

- **localStorage limit**: ~5MB per origin. Show a warning banner if usage exceeds 4MB, suggesting export
- **Performance**: optimize rendering for trees with up to ~500 persons
- **Validation**: prevent circular parent-child relationships (a person cannot be their own ancestor)
- **No authentication** - this is a purely client-side app
- **No server-side state** - Bun.serve() only serves static files
- **Accessibility**: proper ARIA labels, keyboard navigation for modals, sufficient color contrast
