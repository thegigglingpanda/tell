# TELL

**A one-thumb extraction run where the hunter learns you faster than you learn the map.**

▶ **[Play in your browser](https://thegigglingpanda.github.io/tell/)** — one click, nothing to install. Works on desktop and phone.

Built as Question 1 of the Lila Games design test. No engine, no build step, no dependencies: one HTML file, plain shapes, ~600 lines of vanilla JavaScript.

---

## What it is

You drop into the dark with a small circle of light. There are crates. Every crate you take is worth something, and **every crate you take makes your light smaller.** Four gates sit at the edges of the map — reach one and you bank the haul. Die and you drop everything you were carrying.

The whole game is one question, asked every twenty seconds or so: **one more crate, or leave?**

There is one other thing down there. It cannot see in the dark either. So it learns you instead.

## Controls

Tap or click anywhere to move. You loot by walking over a crate. That's all of it.

## The Stalker

It doesn't chase. It predicts.

Across runs it builds a behavioural profile — which gate you bank through, whether you work the perimeter or the middle, how greedy you get before leaving, whether you run in straight lines when frightened, whether you freeze when it's close. Then it acts on that profile *before you've noticed it exists*: when you're carrying a heavy load, it stops hunting and goes to wait at the gate you always use.

At the end of every run it tells you, in plain sentences, what it has worked out:

```
IT HAS LEARNED:
— You work the edges first. The middle frightens you.
— When I am close, you run in straight lines.
— You leave through the north gate. You always do.
```

Two things are deliberately kept separate in the code:

- **`traits()`** — what it currently *believes*. Can change, can be wrong, and states its own confidence: with a single data point it says *"I will remember that,"* not *"you always do."*
- **`knowledge()`** — how much it has *figured out*. A high-water mark, because a progression meter that goes down is a broken promise. It approaches but never reaches 100 — it never fully knows you.

No model, no inference, no server. A few hundred lines of arithmetic and one honest sentence at the right moment. Profile state lives in memory for the tab session.

## Running it locally

```bash
git clone https://github.com/thegigglingpanda/tell.git
cd tell
python3 -m http.server 8000
# open http://localhost:8000
```

Or just open `index.html` directly — there's nothing to serve.

## Automated playtests

Two Playwright scripts drive real runs against the build. They found four bugs during development, including an extraction that made no sound and a knowledge meter that was silently going *down* between runs.

```bash
npm install playwright
node test.js       # smoke test: 4 runs, checks for JS errors, reports FPS and learned traits
node capture.js    # drives 8 runs with one deliberate habit, screenshots each end card
```

`capture.js` is how the progression figures in the writeup were made. Nothing in them is mocked up.

## Files

| | |
|---|---|
| `index.html` | the entire game |
| `test.js` | smoke test + error/FPS check |
| `capture.js` | scripted-habit playtest, captures end cards |

## Performance

**Targeting** 60 fps on mid-tier Android. Measured 62 fps in headless Chromium on a desktop, which is not the same claim and shouldn't be read as one — it hasn't been profiled on a phone yet.

Grid pathfinding is BFS over a ~550-tile board, line-of-sight is a cheap raycast, and the whole render is filled rectangles. The budget went into feel, not fidelity.

## AI disclosure

The implementation was written with Claude in a working session. Every design decision — what the game is about, what it feels like, what it refuses to monetise, and what I'd kill — is mine, and I argued each fork against counterpoints rather than accepting the first answer. The full decision log, including the arguments I lost, is in the writeup submitted alongside this repo.

## Licence

MIT — see [LICENSE](LICENSE).
