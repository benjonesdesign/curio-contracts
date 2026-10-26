# Whole-card crop spec for `POST /api/identify/match` (W15 Tier 1)

**DRAFT with the contract (curio-contracts #42, v0.2.3, untagged). Audience: iOS and Android.** The same crop also serves the Quick Scan guide, so build it once.

## Why this is a spec and not "a best effort"
Picture matching compares the *whole card* against the catalogue. Measured by the backend spike (26 Oct 2026; 19,492 Pokémon EN cards, 1,497 queries, **synthetic** phone-photo damage: lighting shift, blur, noise, glare, JPEG; real photos pending):

| Image sent | Right card first | Right card in first five |
|---|---|---|
| Perfect crop | 97.7% | 100% |
| Crop off by up to **2°** and a **1 to 2%** margin | **96.3%** | **99.5%** |
| Crop off by up to **4°** and a **3 to 5%** margin | 58.2% | 67.2% |
| Raw photo (up to 7°, table around the card) | 22.9% | 32.2% |

There is a **cliff between 2° and 4°**. Inside the tolerance the match is very good; outside it a confident-looking wrong answer is likely. So the app must meet the tolerance, and when it cannot, it must not send the image.

## The crop the app sends
1. **One image of ONE card**, JPEG, sRGB, quality 70 to 85. No filters, sharpening, HDR tone-mapping, beautification or overlays.
2. **Perspective-corrected**: the card is a rectangle in the output, not a trapezoid.
3. **Upright**: the card's top edge is at the top; the text reads the normal way up. Residual rotation **no more than about 2°**.
4. **Card edges at the frame**: each of the four card edges within **about 2%** of the matching image edge (the card fills at least 96% of the width and of the height). The rounded corners will show a sliver of background; that is expected.
5. **Card-shaped**: width : height = 63 : 88 (0.716), within 3%. Do not stretch a non-card rectangle to fit.
6. **Size**: about **400 px on the long side** (for example 286 x 400). The server refuses over about 400 KB decoded (`image_too_large`); below about 250 px on the long side detail is lost.
7. Sent base64 in `image` of `IdentifyMatchRequest`, with no data-URL prefix. Optional `setCode` / `collectorNumber` from on-device OCR narrow the candidates; send them when read.

## Send only when the quad is confident
The tolerance above is on **the image that is sent**, not on the camera still. On iOS that image is Quick Scan's `ocrImage`: the detected quad, perspective-corrected and upright with `CIPerspectiveCorrection` (NOT the still cropped to the guide rectangle, which can include table). It exists only when the detector found a quad, and the client **sends it only when the quad is confident**; with no confident quad the client falls through. The edge margin and angle actually reachable depend on the platform detector's accuracy (Vision on iOS), which needs real photos and a device check: that is for the app to measure, and the server's `crop` signal below is how the two sides learn what a good quad is.

## How to build it (platform-neutral)
1. Detect the card's quadrilateral in the live frame (iOS: `VNDetectRectanglesRequest` with aspect ratio about 0.716 and a minimum confidence you choose; Android: ML Kit object / document detection or OpenCV contour + approx polygon).
2. Warp it to an upright rectangle of 63:88 at about 286 x 400 (iOS: `CIPerspectiveCorrection` or a homography; Android: `warpPerspective` / `PerspectiveTransform`).
3. **Check the result before sending** (this is the gate): run the same detector on the *corrected* image. Accept only if (a) it finds the card, (b) each of its four edges is within 2% of the frame edge, (c) its edges are within 2° of horizontal / vertical, and (d) the original quadrilateral's aspect ratio was within 0.716 +- 5% (a card held at a steep angle warps to a stretched image: reject it).
4. If the card is partly out of frame (any corner cut off) the crop fails.

## When the crop cannot meet the tolerance
**Do not call `/api/identify/match`. Fall through to the next tier** (Tier 0 text read, or the AI identify, per the cascade), exactly as for `unavailableReason: "index_not_ready"`. Never send a loose crop "to see what happens": at 4° it returns the right card first only 58% of the time, and a wrong first card is worse than no match. Prompt the seller to steady the card or move closer only through the existing Quick Scan coach lines; no new copy is defined here.

## How the server reports "the crop looked loose"
`IdentifyMatchResponse.crop` is the server's own read of the crop it was sent: **`ok`** (looks within the tolerance), **`loose`** (a re-framed copy of the image matched noticeably better, so any candidates are less reliable), **`unknown`** (not assessed; also what an omitted field means). When the crop is loose enough that the server will not answer, `unavailableReason` is **`crop_loose`** (and `crop` is `loose`). **The first server version always answers `unknown`**: the check and its threshold come from real photos (FOR-BEN 128), not from the synthetic spike. The app should record, per scan, its detector's quad confidence, the measured margin and angle of the image it sent, and the response's `crop` and `unavailableReason`; comparing them over real scans is how to learn which quads are good. (A field for this in the scan trace is a separate, additive contract change if wanted.) Treat `crop_loose` like `index_not_ready`: fall through to the next tier.

## What is NOT measured yet (do not invent thresholds for these)
Blur, glare coverage and curved holo glare, shadows, perspective residual after correction, sleeves and toploaders, worn or creased cards, a thumb on the card edge, and any game other than Pokémon EN. Ben's real phone photos (FOR-BEN 128) are the test for these; this spec will gain numbers (or a gate) for the ones that matter once they are in. If real photos show crops are not reliably within tolerance, the answer is a more tolerant matcher on the server (a learned embedding, pending Ben's approval of a named model file), not a looser spec.

## What the server does with the image
Fingerprints it and discards it. Nothing is stored, and neither the image nor its fingerprint is logged against a user. An anonymous Quick Scan may call the route (product owner ruling, 26 Oct; provisional limit 30 requests per 5 minutes anonymous, 120 signed in).
