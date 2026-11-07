# The Skill Loop talk

Slides for "The Skill Loop: Test, Detect, Improve": turning AI research into repeatable measurement skills. Baseline, detect effectiveness drift, test the fix, and review before anything changes.

Live at [talk.organizedai.vip/skill-loop](https://talk.organizedai.vip/skill-loop/). Static assets in [public/](public/), deployed as a Cloudflare Worker ([wrangler.jsonc](wrangler.jsonc)).

---

Maintained by Jordaaan Hill ([LinkedIn](https://www.linkedin.com/in/jordaaanhill)).

## The Build Lab · RiverHacks × NASA Space Apps

Live at [talk.organizedai.vip/NASA](https://talk.organizedai.vip/NASA/) (the path is case-sensitive). Ten slides for the student team, with a Present mode (press P) and GSAP transitions.

- Slide source: [docs/NASA/project](docs/NASA/project) (the Slides artifact's files). Build the page with `python3 tools/build_nasa_deck.py docs/NASA/project public/NASA/index.html`; the motion layer is [tools/nasa_motion.js](tools/nasa_motion.js) and [tools/nasa_motion.css](tools/nasa_motion.css).
- Figures: isometric figures built with the [Anatomy](https://github.com/wheresryan22/anatomy) kit (MIT, vendored in [tools/anatomy](tools/anatomy)). The desk computer and arcade cabinet are adapted from Anatomy's examples; the rocket is new. Rebuild with `node tools/anatomy/figs/desk.mjs …`, `node tools/anatomy/figs/arcade/build.mjs --out=public/NASA/fig-build.html` and `node tools/anatomy/figs/rocket.mjs --out=public/NASA/fig-rocket.html`.
- Film and clips: `public/NASA/build-lab-film.mp4` (narrated) and `public/NASA/clips/*.gif`, cut from it.
