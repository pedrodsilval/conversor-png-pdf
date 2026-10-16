from PIL import Image, ImageDraw

# Create teste1.png (800x600)
img1 = Image.new('RGB', (800, 600), (255, 235, 235))
d1 = ImageDraw.Draw(img1)
d1.rectangle([50, 50, 750, 550], fill=(239, 68, 68))
d1.ellipse([250, 150, 550, 450], fill=(255, 255, 255))
img1.save('teste1.png', 'PNG')

# Create teste2.png (500x900)
img2 = Image.new('RGB', (500, 900), (235, 245, 255))
d2 = ImageDraw.Draw(img2)
d2.rectangle([40, 40, 460, 860], fill=(37, 99, 235))
d2.ellipse([150, 350, 350, 550], fill=(255, 255, 255))
img2.save('teste2.png', 'PNG')

print("Test images created!")
