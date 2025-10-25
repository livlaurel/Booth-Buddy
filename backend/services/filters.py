from PIL import Image, ImageEnhance, ImageFilter
from typing import Literal

FilterType = Literal["grayscale", "sepia", "brightness", "contrast", "blur", "sharpen"]

def apply_filter(image: Image.Image, filter_type: FilterType, intensity: float = 1.0) -> Image.Image:
    """
    Apply a filter to an image.
    
    Args:
        image: PIL Image to filter
        filter_type: Type of filter to apply
        intensity: Filter intensity (0.0 to 2.0, default 1.0)
    
    Returns:
        Filtered PIL Image
    """
    img = image.copy().convert("RGBA")
    
    if filter_type == "grayscale":
        # Convert to grayscale
        gray = img.convert("L")
        result = Image.new("RGBA", img.size)
        result.paste(gray)
        # Blend with original based on intensity
        return Image.blend(img, result, min(max(intensity, 0.0), 1.0))
    
    elif filter_type == "sepia":
        # Apply sepia tone
        pixels = img.load()
        width, height = img.size
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                tr = int(0.393 * r + 0.769 * g + 0.189 * b)
                tg = int(0.349 * r + 0.686 * g + 0.168 * b)
                tb = int(0.272 * r + 0.534 * g + 0.131 * b)
                pixels[x, y] = (
                    min(255, int(r + (tr - r) * intensity)),
                    min(255, int(g + (tg - g) * intensity)),
                    min(255, int(b + (tb - b) * intensity)),
                    a
                )
        return img
    
    elif filter_type == "brightness":
        # Adjust brightness (0.5 = darker, 1.0 = normal, 1.5 = brighter)
        enhancer = ImageEnhance.Brightness(img)
        return enhancer.enhance(intensity)
    
    elif filter_type == "contrast":
        # Adjust contrast (0.5 = less contrast, 1.0 = normal, 1.5 = more contrast)
        enhancer = ImageEnhance.Contrast(img)
        return enhancer.enhance(intensity)
    
    elif filter_type == "blur":
        # Apply gaussian blur
        rgb = img.convert("RGB")
        blurred = rgb.filter(ImageFilter.GaussianBlur(radius=intensity * 3))
        result = Image.new("RGBA", img.size)
        result.paste(blurred)
        result.putalpha(img.split()[3])  # Preserve alpha channel
        return result
    
    elif filter_type == "sharpen":
        # Sharpen image
        rgb = img.convert("RGB")
        sharpened = rgb.filter(ImageFilter.SHARPEN)
        result = Image.new("RGBA", img.size)
        result.paste(sharpened)
        result.putalpha(img.split()[3])
        # Apply intensity
        return Image.blend(img, result, min(max(intensity, 0.0), 1.0))
    
    return img
