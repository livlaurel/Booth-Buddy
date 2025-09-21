import io, base64
from typing import List, Tuple
from PIL import Image

def _decode_data_url(data_url: str) -> Image.Image:
    if "," not in data_url:
        raise ValueError("Invalid data URL")
    _, b64 = data_url.split(",", 1)
    raw = base64.b64decode(b64)
    return Image.open(io.BytesIO(raw)).convert("RGBA")

def compose_vertical_strip(
    frame_urls: List[str],
    frame_width: int | None = None,
    padding: int = 16,
    bg: Tuple[int, int, int, int] = (255, 255, 255, 255),
) -> Image.Image:
    if len(frame_urls) != 4:
        raise ValueError("Exactly 4 frames are required")
    frames = [_decode_data_url(u) for u in frame_urls]

    if frame_width:
        frames = [f.resize((frame_width, int(f.height * frame_width / f.width))) for f in frames]

    w = min(f.width for f in frames)
    frames = [f.resize((w, int(f.height * w / f.width))) for f in frames]

    total_h = sum(f.height for f in frames) + padding * 3
    canvas = Image.new("RGBA", (w, total_h), bg)

    y = 0
    for i, f in enumerate(frames):
        canvas.paste(f, (0, y))
        y += f.height + (padding if i < 3 else 0)

    return canvas.convert("RGBA")
