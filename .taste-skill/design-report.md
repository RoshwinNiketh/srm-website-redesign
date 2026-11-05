# SRM campus concept

## Art direction

The campus becomes the website's navigation. Visitors encounter the archgate, select a destination on the landscape, and arrive at a school-specific degree preview.

The direction draw selected “The page is the object”, seed 154226478. The campus itself supplies that object. The user's explicit cinematic, hyperreal campus brief takes precedence over the dealt invitation-card composition, serif typography and olive-on-bone palette. The final composition uses full-bleed architecture, Manrope, deep forest green and sunlight gold. No direction redraw was run.

The visual concept assumes the Kattankulathur campus. Its building locations, entrance architecture, school associations, degree pathways, copy and custom SRM-inspired seal are illustrative and need confirmation against university references. The existing GLB and its preview were preserved. The delivered scene uses generated architectural images, parallax and a camera-like image transition. A navigable real-time 3D campus remains a later implementation stage.

The reference at https://www.igloo.inc/ was opened in the browser but remained on its loader. Its completed interaction sequence could not be reviewed.

## Visual review

The final responsive inspection completed with zero failures at 1440, 768 and 390 pixels. Its two warnings concern the number of type sizes and the absence of video. The sizes include the brand wordmark, control symbols and responsive display text. The imagery is an architectural concept, so parallax and zoom provide motion without introducing unrelated footage.

The visual review corrected long headings, small labels, an inactive transition layer that affected collision detection, and a mobile campus label near the zoom controls.

Subjective final assessment is design 8/10, usability 8/10, creativity 8/10 and content 7/10. The weighted assessment is 7.9/10. Geographic fidelity and verified academic content remain the main gaps.

## Executed interaction checks

- All five destination panels open with four example degree pathways each.
- School selectors update their imagery, copy and destination action.
- Escape and return controls close the panel and restore trigger focus.
- Campus zoom and reset transform the landscape and markers together.
- Ambient sound switches on and off.
- Mobile navigation opens, closes and follows its links.
- Reduced-motion mode omits the travel overlay.
- No horizontal overflow at 390 pixels.
- No JavaScript page errors or missing asset responses during the interaction checks.

## Assets and credits

The built-in image generation tool produced three original architectural concept images. Each source PNG and optimized WebP is stored in `assets/images`. The engineering and medical images are crops of the aerial concept. The footer identifies the imagery as AI-generated architectural visualizations. No third-party campus photographs or footage were used.

- `campus-aerial.png` and `campus-aerial.webp` show the campus overview.
- `archgate.png` and `archgate.webp` show the entrance scene.
- `campus-life.png` and `campus-life.webp` show the courtyard.
- `engineering.webp` and `medical.webp` are overview crops.
- Manrope is bundled locally under its SIL Open Font License in `assets/fonts/OFL.txt`.

## Image generation prompts

### Campus overview

Use case: stylized-concept. Asset type: full-bleed cinematic website hero background, 16:9 landscape, high resolution. Create an extraordinarily photorealistic aerial architectural visualization inspired by SRM Institute of Science and Technology Kattankulathur campus in Tamil Nadu India. Vast verdant tropical university campus, characteristic tall orange terracotta and cream modern academic tower with huge dark reflective glass central facade and curved arch at base, adjacent mustard-yellow glass tech park tower, white rectangular academic buildings, medical college block, running track partly visible far right, palm-lined roads weaving through dense lush trees and lawns, a broad entrance boulevard and monumental pale stone archgate in lower foreground. Drone perspective at 90 meters, looking diagonally across campus. Buildings realistically integrated in landscape, realistic subtle wear, trees individually detailed. Campus concentrated across center and lower two thirds, horizon very high, cinematic atmospheric haze behind. Early morning blue light with warm sunlight from right, warm building reflections contrasting rich forest teal shadows, distant green hills. Premium Unreal Engine 5 raytraced quality, architectural photography, physically accurate materials, extremely detailed foliage, natural proportions, NO floating islands, NO toy or miniature look. Composition supports white typography in upper left quadrant which should be dark tree canopy fading naturally into atmospheric dark blue sky, most prominent warmly sunlit academic towers at center-right. Lower left should be dark foliage or dark green lawn. NO typography, labels, map markings, logos, watermarks, no UI. This is a convincing aspirational campus concept, luxurious restrained cinematic color grade.

### Archgate

Use case: stylized-concept. Create a cinematic photorealistic architectural photograph as a website wide landscape 16:9 background. Aspirational SRM Kattankulathur university campus India entrance. Ground-level centered view approaching an imposing pale ivory stone triple-arched entrance gate, the huge central rounded arch frames a palm-lined boulevard and distant orange terracotta and dark reflective glass academic tower with curved arch at its base, adjacent cream and mustard yellow academic buildings. Intricately carved university-style stone gate, no words or logos. Wet dark asphalt reflects subtle golden sunlight. Tropical dense foliage either side. Very early blue-hour morning with warm sunrise on right, filmic deep forest green shadows, pale soft sky, gentle distant mist. Tiny pedestrians far away for scale. Shot on architectural tilt shift 35mm lens, physically accurate materials, detailed realistic foliage, cinematic Unreal Engine 5 architectural visualization, exceptionally luxurious. Composition gateway spans middle two thirds image. NO text, no signs, no watermarks, no interface.

### Campus life

Use case: stylized-concept. Asset type: cinematic wide landscape website background, 16:9. An exceptionally photorealistic premium architectural photograph of a tropical university campus courtyard in Tamil Nadu India. Human eye level view, broad modern cream and pale stone academic building with shaded colonnades to right, rich green mature trees and tall palms frame the scene, lush lawn, curved pathways, warm orange academic tower subtly visible far background, a few tiny students walking in distance. Low sun golden early morning light streams between palms, intricate detailed tree shadows on paths, lush green tropical plants, deep forest teal shadow grade, natural accurate materials and lighting, high-end architecture photography on 35mm lens, Unreal Engine 5 raytraced architectural visualization, cinematic inviting university life, no overprocessed HDR, no floating architecture. Foreground left filled with dark trees and shadowed lawn for white website text overlay, main illuminated courtyard on right half. No text, labels, watermarks or UI.
