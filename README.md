# Back Rent Computation — Hawaiʻi Ceded Lands

Financial model for computing back rent owed on federal-seized and state-leased ceded public trust lands in the State of Hawaiʻi.

## Data Sources

- **Executive Order 11167** (Aug 15, 1964): 84,057 acres at Pōhakuloa Training Area
- **Executive Order 11166** (Aug 15, 1964): 3,236 acres at Mākua Military Reservation
- **Executive Order 11165** (Aug 15, 1964): 0.5 acres at Fort Shafter
- **1969 "Public Land Policy in Hawaii: An Historical Analysis"**, Table 9
- **DLNR Report to the 33rd Legislature** (2026 Regular Session)
- **Hawaiʻi Military Land Use Master Plan** (HMLUMP 2021)
- **Admission Act** Sections 5(b), 5(d), 5(f)

## Deployment

### Netlify (drag-drop)

1. Run `npm install && npm run build`
2. Drag the `dist/` folder onto [app.netlify.com/drop](https://app.netlify.com/drop)

### Netlify (Git)

1. Push this repo to GitHub/GitLab
2. Connect to Netlify — build settings are in `netlify.toml`

### Local development

```bash
npm install
npm run dev
```

## License

Public domain analytical tool. Not legal or financial advice.
