"""Creates the sized WebP images the site serves. Run after changing a source image:
python tools/optimize_images.py

Photos with a PNG original are encoded from it, to avoid compressing twice.
"""
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
images = root / "assets" / "images"
brand = root / "assets" / "brand"
WIDTHS = [640, 960, 1280]
QUALITY = 72


def source(name):
    png = images / f"{name}.png"
    return Image.open(png if png.exists() else images / f"{name}.webp").convert("RGB")


for name in ["campus-aerial", "archgate", "campus-life", "engineering", "medical"]:
    photo = source(name)
    photo.load()
    photo.save(images / f"{name}.webp", "WEBP", quality=QUALITY, method=6)
    for width in WIDTHS:
        if width < photo.width:
            height = round(photo.height * width / photo.width)
            photo.resize((width, height), Image.LANCZOS).save(
                images / f"{name}-{width}.webp", "WEBP", quality=QUALITY, method=6
            )

logo = Image.open(brand / "srm-logo.png").convert("RGBA")
logo.resize((408, round(logo.height * 408 / logo.width)), Image.LANCZOS).save(
    brand / "srm-logo.webp", "WEBP", quality=88, method=6
)
emblem = Image.open(brand / "srm-emblem.png").convert("RGBA")
emblem.resize((112, 112), Image.LANCZOS).save(brand / "srm-emblem.webp", "WEBP", quality=88, method=6)

for path in sorted(list(images.glob("*.webp")) + list(brand.glob("*.webp"))):
    print(f"{path.stat().st_size // 1024:>5} KB  {path.name}")
