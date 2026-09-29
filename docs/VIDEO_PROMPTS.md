# Ambient video prompts (Gemini / Veo)

Run each prompt in Gemini (Veo). Save the raw file as
`assets-src/video/<id>.mp4` (and `<id>-portrait.mp4` where asked). They get encoded
to web-ready webm/mp4 and posters by `node scripts/optimize-media.mjs`.

## Global spec (applies to every clip)
- 16:9, 1080p, 24fps, **no audio needed** (it is stripped).
- 6–8 seconds. Slow, continuous camera motion: no cuts, no whip pans, no zooms that snap.
- **Loop-friendly:** the first and last frames should look similar (steady light, subject in a similar pose). The site crossfades the loop point, so it doesn't need to be perfect.
- **Grade:** 35mm film look, Kodak Portra warmth, soft grain, paper-cream highlights, deep warm-ink shadows, one small emerald-green accent. No teal-and-orange blockbuster grade.
- **Always add this negative line:** *no text, no subtitles, no logos, no watermarks, no readable screens, no distorted hands or faces, no people looking into the camera, no fast motion.*

If a result has warped hands or faces, regenerate. Uncanny people would undermine a brand built on trust.

---

## 1. `hero-loop`: the signature hero (most important)
> Cinematic slow dolly push-in, 8 seconds. Dawn in Kigali, Rwanda: golden light over green terraced hills and low mist, seen through a floor-to-ceiling office window. The camera drifts gently forward past a small plant with deep green leaves toward a Rwandan woman recruiter in her thirties in a linen blazer, seated at a long timber desk, calmly reading a laptop. She pauses, thinks, then makes a small note. Quiet, confident, observational documentary style. Shot on 35mm film, Kodak Portra 400, soft grain, warm cream and terracotta palette, shallow depth of field. Steady, very slow camera. No text, no logos, no readable screens, no distorted hands or faces, nobody looking into the camera, no fast motion.

**Also make a portrait version** → `hero-loop-portrait.mp4` (9:16, same prompt, "vertical framing, subject centred").

## 2. `closing-loop`: final call to action (behind "Hiring decisions that move faster…")
> Slow lateral tracking shot, 8 seconds, evening. A modern Kigali office in deep warm shadow; city lights twinkle on the hills through the window behind. A Rwandan hiring manager sits back, gives a small nod of resolve, and gently closes a laptop. Soft practical desk-lamp light, lots of dark negative space in the upper half of the frame for text overlay. Documentary, 35mm film look, Kodak Portra, soft grain, warm ink shadows, a single emerald-green accent. Very slow, steady camera. No text, no logos, no readable screens, no distorted hands or faces, nobody looking into the camera.

## 3. `imigongo-light`: texture loop for the marquee band and transitions
> Extreme macro shot, 8 seconds, locked-off camera with a very slow sideways drift. Traditional Rwandan imigongo relief art: raised geometric zigzag and concentric diamond ridges in matte earthen material painted terracotta, deep black and chalky cream. A soft beam of warm raking light slowly sweeps across the ridges from left to right, shadows lengthening and shifting. Fine dust particles float in the light. Fills the frame edge to edge. Tactile, meditative, museum-quality. No text, no people, no wall edges, no fast motion.

## 4. `prep-loop`: Prep Hub (candidate side)
> Gentle handheld-steady medium shot, 6 seconds, morning. A confident young Rwandan woman at home by a bright window, wearing wired earbuds, practising an interview answer toward her laptop, speaking softly, small nods, glancing down at her handwritten notebook, then looking up with quiet confidence. Warm natural light, a small green plant on the sill. 35mm documentary film look, Kodak Portra, soft grain, cream and terracotta palette. No text, no logos, no readable screens, no distorted hands or faces, not looking into the camera.

## 5. `hands-review` (optional): walkthrough or flow accent
> Top-down macro shot, 6 seconds, slow drift. A hand holding a pencil calmly annotates a printed shortlist on a timber desk: ticks, a short underline, a circled note (marks only, no readable words). Late amber light rakes across the paper. 35mm film look, soft grain, warm cream and ink palette, one emerald-green pencil. No readable text, no logos, no distorted fingers.

---

### Where each clip goes on the site
| Clip | Section | Treatment |
|---|---|---|
| hero-loop (+portrait) | Hero | Media window that expands to full-bleed on scroll, with the emerald signal dots layered over it |
| closing-loop | Final CTA | Full-bleed behind a night overlay and the word-reveal headline |
| imigongo-light | Marquee band | Clay multiply blend behind the marquees |
| prep-loop | New Prep Hub strip | Framed media beside the candidate copy |
| hands-review | Flow (optional) | Small inset beside the drawn line |

Until the clips arrive, the generated stills are used as posters, so the site is never blank.
