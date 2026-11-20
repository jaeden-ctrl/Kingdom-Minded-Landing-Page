import numpy as np
from PIL import Image, ImageDraw, ImageFilter
import sys
W, H = 1600, 1000
rng = np.random.default_rng(7)

def blur(a, r):
    im = Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8))
    return np.asarray(im.filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255

def noise(scale, r):
    n = rng.random((H // scale + 2, W // scale + 2)).astype(np.float32)
    im = Image.fromarray((n * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
    return blur(np.asarray(im).astype(np.float32) / 255, r)

def mask(draw_fn, r=0):
    im = Image.new('L', (W, H), 0); d = ImageDraw.Draw(im); draw_fn(d)
    if r: im = im.filter(ImageFilter.GaussianBlur(r))
    return np.asarray(im).astype(np.float32) / 255

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)

# --- stone/plaster walls: warm, mottled, darker toward edges
plaster = 0.55 * noise(40, 6) + 0.3 * noise(12, 2) + 0.15 * noise(4, 1)
cx, cy = W * 0.52, H * 0.48
dist = np.sqrt(((xx - cx) / W) ** 2 * 1.4 + ((yy - cy) / H) ** 2)
lum = np.clip(1.08 - dist * 1.05, 0.2, 1.0) * (0.55 + 0.45 * plaster)
base = np.stack([lum * 0.62, lum * 0.52, lum * 0.42], -1)

# side walls in perspective (darker trapezoids left and right)
left = mask(lambda d: d.polygon([(0, 0), (430, 120), (430, 760), (0, H)], fill=255), 12)
right = mask(lambda d: d.polygon([(W, 0), (1130, 120), (1130, 760), (W, H)], fill=255), 12)
base *= (1 - 0.35 * left[..., None]) * (1 - 0.18 * right[..., None])

# vaulted ceiling ribs converging to the back
ribs = mask(lambda d: [d.arc([cxx - rw, 60 - rh, cxx + rw, 60 + rh * 1.6], 180, 360, fill=255, width=7)
                       for cxx, rw, rh in [(W * .52, 430, 260), (W * .52, 330, 230), (W * .52, 240, 200), (W * .52, 520, 300)]], 3)
base += ribs[..., None] * np.array([0.22, 0.19, 0.15])
vault = mask(lambda d: d.ellipse([W * .52 - 560, -380, W * .52 + 560, 260], fill=255), 40)
base *= (1 - 0.22 * vault[..., None])

# back-wall arched windows (bright) + side windows on the right
def arch(d, x, y, w, h):
    d.rectangle([x, y + w // 2, x + w, y + h], fill=255); d.ellipse([x, y, x + w, y + w], fill=255)
wins = mask(lambda d: [arch(d, *a) for a in [(800, 300, 60, 290), (690, 335, 54, 250), (916, 335, 54, 250)]], 4)
side = mask(lambda d: [arch(d, *a) for a in [(1222, 150, 62, 330), (1372, 70, 88, 450)]], 4)
glass = np.clip(wins + side, 0, 1)
# mullions
mull = mask(lambda d: [d.line([(830, 330), (830, 590)], fill=255, width=3), d.line([(800, 430), (860, 430)], fill=255, width=3),
                       d.line([(1222, 300), (1284, 300)], fill=255, width=3), d.line([(1416, 110), (1416, 520)], fill=255, width=4), d.line([(1372, 300), (1460, 300)], fill=255, width=4)])
glass *= 1 - 0.6 * mull
glow = blur(glass, 22) * 0.55 + blur(glass, 90) * 0.5

# --- light beams from the right windows falling down-left onto the floor
beams = np.zeros((H, W), np.float32)
for (x0, y0, x1, y1, w0, w1, a) in [
        (1416, 280, 700, 990, 55, 230, 0.95),
        (1253, 320, 470, 960, 34, 170, 0.75),
        (1416, 150, 1000, 860, 26, 110, 0.45)]:
    m = mask(lambda d: d.polygon([(x0 - w0, y0), (x0 + w0, y0), (x1 + w1, y1), (x1 - w1, y1)], fill=255), 26)
    fade = np.clip(1 - (yy - y0) / (y1 - y0 + 1), 0.15, 1)
    beams += m * fade * a
beams = blur(beams, 12) * (0.75 + 0.25 * noise(30, 8))

# floor: darker, with soft light pools where the beams land
floor = np.clip((yy - 720) / 200, 0, 1)
base *= (1 - 0.35 * floor[..., None])
pools = mask(lambda d: [d.ellipse(e, fill=255) for e in [(420, 880, 1000, 990), (650, 800, 1050, 880), (300, 940, 620, 1000)]], 40)
# altar block at the back
altar = mask(lambda d: d.rectangle([760, 640, 910, 720], fill=255), 2)
base = base * (1 - 0.25 * altar[..., None]) + altar[..., None] * np.array([0.30, 0.26, 0.21]) * 0.6

warm = np.array([1.0, 0.78, 0.48])
img = base + (glow + glass * 0.8)[..., None] * warm + beams[..., None] * warm * 0.55 + pools[..., None] * warm * 0.38

# keep bright areas golden: scale down any pixel whose brightest channel exceeds 1
peak = img.max(-1, keepdims=True)
img = img / np.maximum(1.0, peak / 0.97)

# vignette + grain
vig = np.clip(1.15 - np.sqrt(((xx - W / 2) / W) ** 2 + ((yy - H / 2) / H) ** 2) * 1.3, 0.35, 1)
img *= vig[..., None]
img += (rng.standard_normal((H, W, 1)).astype(np.float32) * 0.018)
img = np.clip(img, 0, 1) ** 1.08
Image.fromarray((img * 255).astype(np.uint8)).save(sys.argv[1], quality=88, optimize=True, progressive=True)
print('ok')
