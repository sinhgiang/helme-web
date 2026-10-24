# Helme: brand voice, keywords and questions

Write every word of the site (page text, buttons, FAQ, release notes, error pages) in this voice, so a
visitor hears one person on every page. Check new text against it before it ships.

## Who is speaking to whom

A colleague who has run several products speaks to a founder who runs several products and does not write
code. The founder is clever and busy, reads English, and has tried AI tools before. They distrust big
promises and notice a vague sentence at once.

## The voice

- Short, direct, concrete. One idea per sentence. A number or a named thing beats an adjective.
- Say what Helme does and what it will not do. The limits (money, keys, real data, real people, the main
  branch) are part of the pitch, not a footnote.
- Plain words for a non-coder. When a technical word is needed (branch, pull request), the sentence around
  it says what it means.
- Calm. No exclamation marks, no hype, no flattery of the reader.

## Words to use

owner, agent, project, ticket, Chief of Staff, Reviewer, waiting list, night shift, morning report, branch,
"you decide", "checked", "sample data".

## Words never to use

revolutionary, unleash, seamless, supercharge, game-changer, elevate, effortless, "10x", "AI-powered" as a
headline, "cutting-edge", "next-generation", "magic".

Also never claim what Helme does not do yet: it cannot be downloaded today, and the site must keep saying so.

## Two lines that sound right

- "Money, secrets, real data and messages to real people are blocked by default."
- "Helme runs on your own PC with Node.js, real terminals and plain files."

## Two lines that sound wrong

- "Unleash a revolutionary AI workforce that seamlessly supercharges your business!"
- "Our cutting-edge platform empowers teams to 10x their output."

## Keywords (what visitors search for)

run several AI coding agents, manage Claude Code agents, AI agents for non-coders, AI chief of staff, review
AI-written code before it ships, AI coding agents on Windows, overnight AI agents.

## Questions visitors really ask (each has an answer on the home page, in the FAQ and in its JSON-LD)

- What exactly is Helme?
- Do I need to know how to code?
- Which AI does it use?
- Can an agent spend money or leak my keys?
- Can the agents work while I sleep?
- How is Helme different from opening Claude Code in several terminals?
- Does it run in the cloud?
- Can I download it?

When a question is added to the FAQ, add the same question and answer, word for word, to the `FAQPage` block
in `index.html`; `npm test` fails when the two differ.

## Release notes

Written for someone who does not code: one sentence on what the release means, then New, Improved and Fixed
lines that say what a person can now do. Sample project names only; no paths from a PC, no ticket numbers.
