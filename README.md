# Wazen Oil Services — Homepage

Production build of the Wazen Oil Services homepage, implemented from a
Claude Design handoff (brand brief + iterative design chat) as a static,
dependency-free HTML/CSS/JS site suitable for GitHub Pages.

**Live site:** see the repository's GitHub Pages URL (Settings → Pages).

## Structure

```
index.html        Page markup
css/styles.css     All styling (brand tokens, layout, components)
js/main.js         Nav scroll/mobile menu, hero video, animated counters,
                    scroll-reveal, tab switching, the interactive Libya
                    footprint map (d3 + topojson, loaded from CDN)
assets/            Logos (SVG), careers photography, hero background video
```

## Notes carried over from the design handoff

- Client/partner logos (NOC, Akakus, Mellitah, Sensia, Swagelok, Kent PLC,
  etc.) render as greyscale text chips — no logo image files were supplied.
  Swap in real marks under `.client-chip` / the partnerships tab's
  `.logo-chip` when available.
- The hero background video is skipped on narrow viewports (≤860px) in
  favor of a static fallback image, per the original brief's mobile
  performance requirement.
- Structure keeps clean anchor ids (`#company`, `#capabilities`,
  `#track-record`, `#footprint`, `#careers`, `#contact`) so nav/footer
  links and future deep-linking stay stable.

## Local preview

Any static file server works, e.g.:

```
npx serve .
```
