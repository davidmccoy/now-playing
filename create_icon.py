from PIL import Image, ImageDraw

# Create a simple 128x128 icon
size = 128
img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Draw a music note symbol
draw.ellipse([40, 80, 60, 100], fill=(147, 51, 234, 255))
draw.rectangle([55, 40, 65, 90], fill=(147, 51, 234, 255))
draw.ellipse([60, 30, 80, 50], fill=(147, 51, 234, 255))

img.save('/Users/david/dev/personal/now-playing/src-tauri/icons/icon.png')
print("Icon created successfully")
