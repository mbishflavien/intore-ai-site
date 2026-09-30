# Hero story: storyboard, copy and image prompts

The hero is a pinned, scroll-driven film in two acts. Everything is scrubbed by
scroll, so scrolling back up rewinds it exactly. It's built from **still layers**
at different depths, the "multiplane camera" technique: each layer moves at its
own speed, so the eye reads real depth with no stretching. The distortion you saw
came from bending a single photo. Layers don't bend.

---

## Storyboard

### Act 1: "From the hills, into the room" (drone / gimbal push-in)
| Scroll | What you see | Layers moving |
|---|---|---|
| 0% | Dawn over Kigali's terraced hills, mist in the valleys. The headline sits in the sky. | Sky and far hills (slow), near foliage (fast, blurred) |
| 0–35% | Camera glides forward. Foliage whips past the lens, and an office building on the hill grows toward us. | Foliage exits frame; building scales up faster than the hills |
| 35–60% | One lit window fills the frame. Through the glass, an interview is in progress. | Building scales past the camera; the window opening becomes the frame |
| 60–75% | We pass through the glass into the room. A structured interview: the candidate speaking, two interviewers listening. | Interior settles; the window frame flies off the edges |

### Act 2: "Overwhelm → signal → clarity"
| Scroll | What you see | How it moves |
|---|---|---|
| 75–85% | Same recruiter as our current hero, but evening: the desk buried in towering CV stacks. | Slow push-in, grey light |
| 85–93% | The sheets lift off the stacks and fly past the camera, then dissolve into emerald signal dots. | Paper sprites at several depths rush toward the lens (the strongest 3D moment) |
| 93–100% | Dawn. The same desk, calm, one explained shortlist. Headline lands, and so does "Book a pilot". | Crossfade to warm light; dots settle into the shortlist that the next section continues |

---

## Chapter copy
Honest by design: no invented statistics, and numbers are phrased as scenarios.

- **Act 1, over the hills:** *AI ranks the shortlist. Humans make the hire.*, with small supporting text "Hiring in Kigali, and everywhere good people apply." and the Book a pilot / See how it works buttons (the current hero content).
- **Act 1, inside the room:** *Every interview, on the record.* "Structured questions, shared scorecards, one comparable record for every candidate."
- **Act 2, overwhelm:** *Four hundred applications. One recruiter. One week.* "Good people get lost in the pile. Not because they're weak, but because nobody has time to read."
- **Act 2, signal:** *IntoreAI reads every one, and writes down why.* "Five dimensions. Written reasoning. Integrity flags a person reviews."
- **Act 2, clarity:** *A shortlist you can defend. A decision that's yours.* Then Book a pilot.

---

## Image prompts (Gemini app)

### How to generate
- Make **2–3 attempts per image** and keep the best.
- Save each one as `assets-src/images/<file name below>.png` at the **highest resolution Gemini offers**.
- **Aspect 16:9** unless the prompt says otherwise.
- **Edit prompts** (marked 🖉): upload the named image first, then paste the prompt. That keeps the camera, light and person consistent.
- **Green-screen prompts** (marked 🟩): I cut these out locally. If an edge comes out rough, that's fine, since I clean it up. Just avoid green reflections on the subject.
- **Reject any image with** warped hands or faces, readable text or logos (including laptop logos), or people looking into the camera.

### Shared style: already included in every prompt below
> 35mm film look, Kodak Portra 400, soft fine grain, warm muted palette of paper cream, warm ink and terracotta, one small deep emerald green accent. Documentary, quiet, unposed. Set in Kigali, Rwanda; people are Rwandan. No text, no logos, no watermarks.

### Act 1

**`drone-hills`**: the far plate (sky + hills, no building)
```text
Ultra-wide cinematic landscape at dawn over Kigali, Rwanda: layers of green terraced hills receding into soft golden mist, low sun glowing behind the far ridges, pale warm sky with a few thin clouds. Shot from a drone at hilltop height, level horizon placed in the lower third, lots of calm open sky in the upper two thirds for a headline. No buildings in the foreground, no people, no roads in the near ground. 35mm film look, Kodak Portra 400, soft fine grain, warm muted palette of paper cream, warm ink and terracotta, one small deep emerald accent in the vegetation. No text, no logos, no watermarks.
```

**`drone-building`** 🟩: the office building that grows toward us
```text
A modern low-rise office building standing on a Kigali hillside at dawn, seen straight-on from the front at the same height as its second floor, the building filling the middle of the frame. Warm timber and cream concrete facade, one large floor-to-ceiling window on the second floor, centred in the image, glowing warm from the lights inside. IMPORTANT: everything that is not the building (sky, hills, ground) is a flat, pure chroma-key green (#00FF00) with no gradients, and the glass of the large centred window is ALSO flat pure green (#00FF00) so it can be cut out. Crisp, clean edges between the building and the green. No green reflections on the building. 35mm film look, soft grain, warm cream, ink and terracotta palette. No text, no logos, no people visible.
```

**`drone-foliage`** 🟩: foreground leaves that whip past the lens
```text
Close-up of lush tropical foliage, banana leaves and a few eucalyptus branches, entering the frame from the left and right edges and the bottom corners, as if the camera is flying low past a hillside garden. Leaves slightly out of focus with warm golden rim light from a dawn sun behind. The centre of the frame is completely empty. IMPORTANT: everything that is not a leaf or branch is a flat, pure chroma-key green (#00FF00) with no gradients. No green reflections tinting the leaves' edges more than natural. 35mm film look, soft grain, warm palette. No text, no logos, no people.
```

**Interior:** we reuse your existing `pillar-interview` photo (the Kigali meeting room with the interview). Nothing new to generate. It already matches the look.

### Act 2

**`overwhelm`** 🖉: upload `assets-src/images/hero-still.jpg` first
```text
Edit this exact photo. Keep the same camera position, lens, framing, room, window, and the same woman in the same pose and clothes. Change only: it is now early evening with cool grey overcast light and a single warm desk lamp on; the long timber desk is buried under tall, leaning stacks of printed CVs and application folders (six or seven stacks, some taller than her head), loose sheets spread across the desk, a cold cup of coffee; her expression is tired and her shoulders slightly slumped. Keep the hills outside the window, now dim and grey-blue. 35mm film look, soft grain. No text, no readable writing on the papers, no logos.
```

**`paper-1` … `paper-6`** 🟩: single sheets for the flying moment (six separate images, **aspect 1:1**)
```text
A single sheet of white A4 printer paper with faint grey lines of blurred, unreadable typed text (like a CV seen from a distance), floating in the air and curled naturally, lit by soft warm window light from the left with a gentle shadow in its curl. Angle: [see list below]. The sheet fills about 70% of the frame. IMPORTANT: the background is flat pure chroma-key green (#00FF00), no gradients, no cast shadow on the background. No readable text, no logos.
```
Use this angle line for each file:
1. `paper-1`: "seen almost flat-on, slightly tilted clockwise"
2. `paper-2`: "tilted 45 degrees away from the camera, curled at the top corner"
3. `paper-3`: "seen nearly edge-on, a thin sliver of paper"
4. `paper-4`: "tumbling, bottom corner closest to the camera, strong curl"
5. `paper-5`: "flat-on but rotated upside down, gentle wave"
6. `paper-6`: "folded in half, mid-flight"

**Clarity:** we reuse `hero-still`, the calm dawn version. Nothing new to generate.

---

## Optional: a real drone video (the best possible Act 1)
If Veo produces it, a real clip beats layers. I'll turn it into a scroll-scrubbed frame sequence (the Apple product-page technique), and the layers become the fallback. Save it as `assets-src/video/drone-push.mp4`.

```text
One continuous 8-second drone shot at dawn in Kigali, Rwanda, with no cuts. The camera starts high above misty green terraced hills with golden light, glides steadily forward and slightly down toward a modern low-rise timber-and-cream office building on a hillside, approaches one large floor-to-ceiling lit window on the second floor, and pushes smoothly through the glass into a warm meeting room where a structured job interview is happening: a young Rwandan woman candidate speaking with an open-hand gesture, two interviewers listening at a wooden table. Constant speed, perfectly steady gimbal motion, no shake, no speed ramps. 35mm film look, Kodak Portra warmth, soft grain. No text, no logos, no distorted faces or hands, nobody looking into the camera.
```

---

## Checklist
- [ ] `drone-hills`
- [ ] `drone-building` 🟩
- [ ] `drone-foliage` 🟩
- [ ] `overwhelm` 🖉
- [ ] `paper-1` … `paper-6` 🟩
- [ ] Optional: `drone-push.mp4`

When they're in `assets-src/`, tell me, and I'll key the green, build the depth layers and wire up the two acts.

---

## Video version (preferred): one clip per scene

Each clip becomes a scroll-scrubbed frame sequence (`node scripts/video-frames.mjs <id> --start <s>`).
Every frame gets frozen on screen while someone scrolls, so these rules matter:

- **One continuous shot, no cuts, 8 seconds.**
- **Slow, constant camera speed**, no speed ramps, a steady gimbal and no shake.
- **Little motion blur**, and no flashes or sudden light changes.
- **16:9**, the highest resolution available.
- **Image-to-video** where marked 🖼: upload that photo as the starting frame so the people and room match the rest of the site.

Save the clips as `assets-src/video/<id>.mp4`.

**`drone-approach`**: hills → building → window (Act 1, follows `drone-hills`)
```text
One continuous 8-second drone shot at dawn over misty green terraced hills in Kigali, Rwanda, matching a golden sunrise with soft mist in the valleys. The camera glides slowly and steadily forward and slightly down toward a modern low-rise office building of warm timber and cream concrete on a hillside, and approaches one large floor-to-ceiling window on the second floor that glows with warm interior light. The shot ends very close to the glass, the window filling the frame, with a meeting room visible inside. Constant slow speed, perfectly steady gimbal, no cuts, no shake, no speed ramps. 35mm film look, Kodak Portra warmth, soft grain. No text, no logos, no people close to camera.
```

**`interview-room`** 🖼 start frame: `assets-src/images/pillar-interview.jpg`
```text
Starting from this exact image, a slow, steady gimbal push-in across the wooden table toward the candidate while she speaks calmly with an open-hand gesture and the two interviewers listen and take a note. Constant slow speed, no cuts, no shake. Natural subtle movement only: blinking, small nods, a page turned. Keep faces, clothes, room and light identical to the image. 35mm film look, soft grain. No text, no logos, nobody looking into the camera, no distorted hands or faces.
```

**`overwhelm`** 🖼 start frame: the `overwhelm` image (or `assets-src/images/hero-still.jpg` if you haven't made it)
```text
Early evening, cool grey light and one warm desk lamp. The same woman sits at a long timber desk buried under tall, leaning stacks of printed CVs; she rubs her temple, tired. Slow, steady push-in toward her. In the second half, a gust from the open window lifts dozens of loose sheets off the stacks and they flutter slowly toward the camera and past it. Constant slow camera speed, no cuts, no shake. 35mm film look, soft grain. No readable text on the papers, no logos, no distorted hands or faces, nobody looking into the camera.
```

**`clarity`** 🖼 start frame: `assets-src/images/hero-still.jpg`
```text
Starting from this exact image at dawn: the woman reviews a short printed list beside her laptop, makes a small confident tick with a pencil, and settles back with a quiet, resolved expression. Golden light slowly grows over the misty hills outside. Very slow, steady push-in, no cuts, no shake. Keep her face, clothes, room and light identical to the image. 35mm film look, soft grain. No readable text, no logos, nobody looking into the camera.
```

Order on the page: `drone-hills` → `drone-approach` → `interview-room` → `overwhelm` → (papers → signal, drawn in code) → `clarity`.
Any clip that's missing falls back to the still-image version, so they can arrive one at a time.
