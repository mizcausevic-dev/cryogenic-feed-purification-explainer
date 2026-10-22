#!/usr/bin/env python3
"""Generate hero image (1200x630 PNG) for the cryogenic feed purification explainer.
Mirrors the app palette and scene geometry. Deterministic, no external assets."""
from PIL import Image, ImageDraw, ImageFont
import math, random, os

W, H = 1200, 630
STAGE = (11, 16, 25); PANEL = (17, 27, 46); STEEL = (52, 66, 87)
CYAN = (0, 229, 255); GOLD = (255, 209, 102); VIOLET = (157, 78, 221)
INK = (232, 238, 247); MUTED = (159, 176, 201); RED = (255, 93, 115); WHITE = (234, 246, 255)

img = Image.new("RGB", (W, H), STAGE)
d = ImageDraw.Draw(img, "RGBA")

# blueprint grid
for x in range(0, W, 44):
    d.line([(x, 0), (x, H)], fill=(159, 176, 201, 14), width=1)
for y in range(0, H, 44):
    d.line([(0, y), (W, y)], fill=(159, 176, 201, 14), width=1)

def font(path_names, size):
    for p in path_names:
        try:
            return ImageFont.truetype(p, size)
        except Exception:
            continue
    return ImageFont.load_default()

SANS_B = ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"]
SANS = ["/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"]
MONO = ["/usr/share/fonts/truetype/cascadia/CascadiaMono.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"]

def rr(box, r, **kw):
    d.rounded_rectangle(box, radius=r, **kw)

# vessels
def vessel(x, y, w, h, name, chip, chip_col):
    grad_top, grad_bot = (61, 81, 115), (38, 52, 75)
    for i in range(h):
        t = i / h
        col = tuple(int(grad_top[c] + (grad_bot[c] - grad_top[c]) * t) for c in range(3))
        d.line([(x, y + i), (x + w, y + i)], fill=col)
    rr([x, y, x + w, y + h], 46, outline=(232, 238, 247, 70), width=2)
    # bed layers
    layers = [(74, 59, 99), (91, 74, 117), (106, 89, 135), (122, 104, 153)]
    bed_y, bed_h = y + 62, h - 124
    for i, col in enumerate(layers):
        lh = bed_h / len(layers)
        rr([x + 10, bed_y + i * lh + 2, x + w - 10, bed_y + (i + 1) * lh - 2], 7, fill=col + (220,))
    # loading wash bottom
    rr([x + 10, bed_y + bed_h * 0.45, x + w - 10, bed_y + bed_h], 7, fill=RED + (70,))
    d.rectangle([x + 14, y + 8, x + w - 14, y + 38], fill=(11, 16, 25, 140))
    f = font(SANS_B, 14)
    d.text(((x + x + w) / 2, y + 15), name, font=f, fill=INK, anchor="ma")
    cf = font(MONO, 9)
    tw = d.textlength(chip, font=cf) + 16
    rr([x + w / 2 - tw / 2, y + h - 40, x + w / 2 + tw / 2, y + h - 22], 9, outline=chip_col, fill=(11, 16, 25, 200))
    d.text((x + w / 2, y + h - 36), chip, font=cf, fill=chip_col, anchor="ma")

# pipes
def pipe(pts, color, width=11):
    d.line(pts, fill=color, width=width, joint="curve")

# feed inlet + pipework
pipe([(30, 440), (300, 440), (300, 420), (392, 420)], STEEL)
pipe([(300, 440), (600, 440), (600, 420), (652, 420)], STEEL)
vessel(360, 150, 128, 290, "VESSEL A", "ADSORBING", CYAN)
vessel(540, 150, 128, 290, "VESSEL B", "STANDBY", VIOLET)
pipe([(458, 150), (458, 128), (760, 128), (760, 210), (838, 210)], STEEL)
pipe([(760, 128), (760, 210)], STEEL)
# cyan purified path
d.line([(458, 128), (760, 128), (760, 210), (850, 210)], fill=CYAN, width=4, joint="curve")

# cold box
bx, by, bw, bh = 838, 130, 250, 320
rr([bx, by, bx + bw, by + bh], 16, fill=(27, 41, 66), outline=CYAN + (90,), width=2)
d.text((bx + 16, by + 14), "COLD BOX", font=font(SANS_B, 15), fill=INK)
d.text((bx + 16, by + 36), "low-temperature separation", font=font(MONO, 10), fill=MUTED)
# exchanger zigzag
pts = []
for i in range(7):
    pts.append((bx + 22 + i * 33, by + 78 + (26 if i % 2 else 0)))
d.line(pts, fill=CYAN, width=3, joint="curve")
# column
cx, cy, cw, ch = bx + 42, by + 130, 66, 150
rr([cx, cy, cx + cw, cy + ch], 24, fill=(36, 51, 79), outline=(232, 238, 247, 60))
for i in range(1, 6):
    yy = cy + i * ch / 6
    d.line([(cx + 9, yy), (cx + cw - 9, yy)], fill=MUTED + (90,), width=1)
rr([bx + 140, by + 148, bx + 212, by + 248], 10, fill=(36, 51, 79), outline=(232, 238, 247, 50))
d.text((bx + 176, by + 188), "separation", font=font(MONO, 10), fill=MUTED, anchor="ma")
d.text((bx + 176, by + 204), "(schematic)", font=font(MONO, 10), fill=MUTED, anchor="ma")
pipe([(bx + bw, 250), (1140, 250)], STEEL, 9)
pipe([(bx + bw, 320), (1140, 320)], STEEL, 9)

# particles in Vessel A
rng = random.Random(42)
for _ in range(46):
    x = 372 + rng.random() * 104
    y = 225 + rng.random() * 200
    kind = rng.random()
    col = WHITE if kind > 0.78 else (RED if kind > 0.62 else (140, 200, 230))
    r = 4 if col != (140, 200, 230) else 3
    d.ellipse([x - r, y - r, x + r, y + r], fill=col)
# cyan dots to cold box
for i in range(9):
    p = i / 9
    x = 470 + p * 380
    y = 128 if p < 0.72 else 128 + (p - 0.72) / 0.28 * 82
    d.ellipse([x - 4, y - 4, x + 4, y + 4], fill=CYAN)

# labels
d.rectangle([30, 388, 48, 391], fill=CYAN)
d.text((30, 396), "FEED AIR IN", font=font(SANS_B, 13), fill=INK)
d.text((30, 416), "from upstream compression + cooling", font=font(MONO, 9), fill=MUTED)
d.text((838, 108), "COLD BOX", font=font(SANS_B, 12), fill=INK)
d.text((838, 92), "", font=font(MONO, 9), fill=MUTED)

# title block bottom-left
d.rectangle([0, 478, W, H], fill=(7, 11, 20))
d.line([(0, 478), (W, 478)], fill=CYAN, width=2)
d.text((36, 498), "CLEAN THE AIR BEFORE YOU COOL IT", font=font(SANS_B, 34), fill=INK)
d.text((36, 542), "Inside cryogenic feed purification  ·  adsorb upstream, regenerate in parallel, protect the cold box", font=font(SANS, 15), fill=MUTED)
d.text((36, 578), "34 S  ·  30 FPS  ·  1,020 FRAMES  ·  CONCEPTUAL SCHEMATIC  ·  KINETIC GAIN ANATOMY EXPLAINER", font=font(MONO, 11), fill=GOLD)
# legend top-right
lx, ly = 906, 24
rr([lx, ly, lx + 258, ly + 62], 10, fill=(7, 11, 20, 210), outline=(159, 176, 201, 60))
for i, (col, txt) in enumerate([(CYAN, "transport"), (GOLD, "energy"), (VIOLET, "control / state")]):
    yy = ly + 10 + i * 16
    d.rectangle([lx + 12, yy, lx + 24, yy + 9], fill=col)
    d.text((lx + 32, yy - 2), txt, font=font(MONO, 10), fill=MUTED)

os.makedirs("public/assets", exist_ok=True)
out = "public/assets/hero-Cursor.png"
img.save(out, "PNG", optimize=True)
print(f"wrote {out} {img.size} {os.path.getsize(out)} bytes")
