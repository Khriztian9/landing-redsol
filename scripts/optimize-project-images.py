"""Generate responsive project photos: python scripts/optimize-project-images.py.

Requires Pillow. Keep the originals in public; generated WebP files and the
manifest are committed so the normal npm build needs no Python dependency.
"""
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
OUTPUT = PUBLIC / 'images' / 'projects'
SOURCES = {
    'fortich-1': 'FORTICH0.JPG', 'fortich-2': 'FORTICH1.jpg', 'fortich-3': 'FORTICH2.jpg',
    'sonreir-1': 'SONREIR0.png', 'sonreir-2': 'SONREIR1.JPG', 'sonreir-3': 'SONREIR2.png',
    'gyte-1': 'GYTE0.JPG', 'gyte-2': 'GYTE1.jpg', 'gyte-3': 'GYTE2.JPG',
}
# The known GYTE original is 16320 × 12288 pixels. Bound input size and decode
# JPEGs at reduced resolution before transposing/resizing, keeping memory low.
Image.MAX_IMAGE_PIXELS = 210_000_000
OUTPUT.mkdir(parents=True, exist_ok=True)
manifest = {}
original_bytes = 0
for key, filename in SOURCES.items():
    source = PUBLIC / filename
    original_bytes += source.stat().st_size
    with Image.open(source) as image:
        if image.width * image.height > 210_000_000:
            raise ValueError(f'Image exceeds supported size: {filename}')
        image.draft('RGB', (1920, 1920))
        image = ImageOps.exif_transpose(image).convert('RGB')
        variants = []
        for width in sorted({min(target, image.width) for target in (640, 1280, 1920)}):
            height = round(image.height * width / image.width)
            name = f'{key}-{width}.webp'
            image.resize((width, height), Image.Resampling.LANCZOS).save(OUTPUT / name, 'WEBP', quality=82, method=6)
            variants.append({'src': f'/images/projects/{name}', 'width': width, 'height': height})
        manifest[key] = variants
(ROOT / 'src/data/projectImages.json').write_text(json.dumps(manifest, indent=2) + '\n')
large_bytes = sum((PUBLIC / versions[-1]['src'].lstrip('/')).stat().st_size for versions in manifest.values())
print(f'Originals: {original_bytes:,} bytes; largest WebP variants: {large_bytes:,} bytes; reduction: {100 * (1-large_bytes/original_bytes):.1f}%')
