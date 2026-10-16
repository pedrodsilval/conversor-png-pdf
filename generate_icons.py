from PIL import Image, ImageDraw, ImageFont
import os

def create_app_icon(size):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Scale factor
    s = size / 512.0
    
    # Background rounded rect
    # Gradient approximation or rich vibrant blue
    draw.rounded_rectangle([0, 0, size, size], radius=int(110 * s), fill=(37, 99, 235, 255))
    
    # Photo card (left tilted slightly)
    # Background card
    card_x1, card_y1 = int(70 * s), int(110 * s)
    card_w, card_h = int(210 * s), int(260 * s)
    draw.rounded_rectangle([card_x1, card_y1, card_x1 + card_w, card_y1 + card_h], radius=int(20 * s), fill=(255, 255, 255, 255), outline=(226, 232, 240, 255), width=max(1, int(4 * s)))
    
    # Inside photo landscape
    p_x1, p_y1 = card_x1 + int(20 * s), card_y1 + int(20 * s)
    p_w, p_h = int(170 * s), int(150 * s)
    draw.rounded_rectangle([p_x1, p_y1, p_x1 + p_w, p_y1 + p_h], radius=int(12 * s), fill=(224, 242, 254, 255))
    
    # Sun
    sun_x, sun_y = p_x1 + int(45 * s), p_y1 + int(40 * s)
    sun_r = int(18 * s)
    draw.ellipse([sun_x - sun_r, sun_y - sun_r, sun_x + sun_r, sun_y + sun_r], fill=(245, 158, 11, 255))
    
    # Mountains in photo
    draw.polygon([
        (p_x1, p_y1 + p_h),
        (p_x1 + int(60 * s), p_y1 + int(70 * s)),
        (p_x1 + int(110 * s), p_y1 + int(120 * s)),
        (p_x1 + int(140 * s), p_y1 + int(95 * s)),
        (p_x1 + p_w, p_y1 + p_h)
    ], fill=(16, 185, 129, 255))
    
    # "PNG" badge
    b_x1, b_y1 = card_x1 + int(45 * s), card_y1 + int(190 * s)
    b_w, b_h = int(120 * s), int(44 * s)
    draw.rounded_rectangle([b_x1, b_y1, b_x1 + b_w, b_y1 + b_h], radius=int(10 * s), fill=(30, 64, 175, 255))
    
    # PDF document (right)
    pdf_x1, pdf_y1 = int(220 * s), int(140 * s)
    pdf_w, pdf_h = int(220 * s), int(270 * s)
    draw.rounded_rectangle([pdf_x1, pdf_y1, pdf_x1 + pdf_w, pdf_y1 + pdf_h], radius=int(20 * s), fill=(255, 255, 255, 255), outline=(254, 202, 202, 255), width=max(1, int(4 * s)))
    
    # "PDF" badge on red
    pb_x1, pb_y1 = pdf_x1 + int(24 * s), pdf_y1 + int(25 * s)
    pb_w, pb_h = int(110 * s), int(48 * s)
    draw.rounded_rectangle([pb_x1, pb_y1, pb_x1 + pb_w, pb_y1 + pb_h], radius=int(10 * s), fill=(220, 38, 38, 255))
    
    # Document text lines
    draw.rounded_rectangle([pdf_x1 + int(24 * s), pdf_y1 + int(95 * s), pdf_x1 + int(185 * s), pdf_y1 + int(110 * s)], radius=int(6 * s), fill=(203, 213, 225, 255))
    draw.rounded_rectangle([pdf_x1 + int(24 * s), pdf_y1 + int(125 * s), pdf_x1 + int(150 * s), pdf_y1 + int(140 * s)], radius=int(6 * s), fill=(226, 232, 240, 255))
    draw.rounded_rectangle([pdf_x1 + int(24 * s), pdf_y1 + int(155 * s), pdf_x1 + int(170 * s), pdf_y1 + int(170 * s)], radius=int(6 * s), fill=(226, 232, 240, 255))
    
    # Green check circle
    chk_cx, chk_cy = pdf_x1 + int(110 * s), pdf_y1 + int(215 * s)
    chk_r = int(32 * s)
    draw.ellipse([chk_cx - chk_r, chk_cy - chk_r, chk_cx + chk_r, chk_cy + chk_r], fill=(16, 185, 129, 255))
    # Check mark
    draw.line([
        (chk_cx - int(14 * s), chk_cy),
        (chk_cx - int(4 * s), chk_cy + int(10 * s)),
        (chk_cx + int(14 * s), chk_cy - int(10 * s))
    ], fill=(255, 255, 255, 255), width=max(2, int(6 * s)))
    
    return img

if __name__ == '__main__':
    icon192 = create_app_icon(192)
    icon192.save('icon-192.png', 'PNG')
    
    icon512 = create_app_icon(512)
    icon512.save('icon-512.png', 'PNG')
    print("Icons generated successfully!")
