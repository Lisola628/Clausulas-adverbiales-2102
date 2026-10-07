# Cláusulas adverbiales

Interactive practice site for Spanish adverbial clauses (time, purpose, condition and contingency, cause, concession) and the choice between indicative and subjunctive. Each topic is a slide deck with a diagram, a mood "switch" to try each rule, a quick click diagnostic, and exercises students write on and keep as a PDF.

Content is adapted from *Spanish for a Sustainable World II* — [Cláusulas adverbiales](https://louis.pressbooks.pub/sustainablespanish/chapter/clausulas-adverbiales/), © Liliana Naranjo, CC BY 4.0. The exercises are new.

**Color code (used everywhere):** blue = indicativo · gold = subjuntivo · green = infinitivo.

## Pages

| File | Topic |
|---|---|
| `index.html` | Route map and how to use the site |
| `01-temporales.html` | cuando, hasta que, después de que, tan pronto como, en cuanto, antes de que |
| `02-finalidad.html` | para que, a fin de que, con el propósito de que (and para + infinitive) |
| `03-condicion-y-contingencia.html` | si, a menos que, con tal (de) que, siempre y cuando, en caso de que, sin que |
| `04-causales-y-concesivas.html` | porque, ya que, dado que, como · aunque, a pesar de que, por mucho que |
| `05-proyecto.html` | Writing project and cultural research planner (timed) |
| `06-repaso-y-referencia.html` | Reference table, decision tree, mixed review, grammar journal |
| `assets/deck.css`, `assets/deck.js` | Shared styles and behavior |

## What students can do

- **Navigate** with the on-screen Anterior / Siguiente buttons, the dots, or the arrow keys (PageUp/PageDown work with a clicker). The deck remembers the last slide.
- **Try the switch** on the idea slide to see how a sentence changes between indicative and subjunctive.
- **Take the quick diagnostic** (click indicativo or subjuntivo; wrong answers can be retried). It is a warm-up and is not saved.
- **Write on the slides.** Answers autosave in the browser on that device (`localStorage`); nothing is sent to a server.
- **Revisar esta diapositiva** checks fill-in blanks and drop-downs on that slide (accent-only mistakes are flagged separately). Open writing has a collapsible model answer.
- **Imprimir / PDF** prints every slide as a page, with typed answers included. Choose "Save as PDF". **Descargar** saves a `.txt` copy. **Borrar** clears the topic after a confirmation.
- **Timers** on partner interviews and the writing tasks (click to start or pause).

## Publish with GitHub Pages

1. Create a new public repository named `clausulas-adverbiales`.
2. Upload the **contents** of this folder (keep `assets/`), or push with git.
3. **Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save**.
4. The site appears at `https://<username>.github.io/clausulas-adverbiales/`.

To preview locally, open `index.html`, or run `python3 -m http.server` here and visit `http://localhost:8000`. Fonts (Bitter, Source Sans 3) load from Google Fonts; without a connection the pages fall back to system fonts.

## Editing

Each deck is plain HTML: one `<section class="slide">` per slide.

- Fill-in blank: `<input class="f blank" data-a="answer|alternative">`; drop-down: `<select class="f" data-a="correct option">`; open writing: `<textarea class="f">`. Keep the `f` class on anything students should be able to save.
- Keep each page's `data-page` value unique (it is the save key).
- Quick diagnostic items use `data-ans` on `.qk`; the switch uses `.switch` with `.sw-ex` examples.

## License

CC BY 4.0 — see `LICENSE.md`.
