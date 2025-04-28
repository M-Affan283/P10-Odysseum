from PIL import Image, ImageDraw, ImageFont
import json
import os
import sys

def format_itinerary(sorted_itinerary):
    if isinstance(sorted_itinerary, str):
        try:
            sorted_itinerary = json.loads(sorted_itinerary)
        except json.JSONDecodeError:
            return "Invalid itinerary format."
        
    formatted_str = ""
    for day, events in sorted_itinerary.items():
        formatted_str += f"{day}:\n"
        for event in events:
            formatted_str += f"    - {event}\n"
        formatted_str += "\n"
    return formatted_str.strip()

def overlay_text_on_template(route, template_path):
    if not os.path.exists(template_path):
        raise FileNotFoundError(f"Template image not found: {template_path}")

    template = Image.open(template_path)  
    draw = ImageDraw.Draw(template)
    font = ImageFont.truetype("verdana.ttf", 30)
    x, y = 50, 250
    for line in route.split("\n"):
        draw.text((x, y), line, fill="black", font=font)
        y += 35
    output_path = "user_itinerary.png"
    template.save(output_path)
    return output_path


TEMPLATES = {
    "1": "./templates/Doc1.png",
    "2": "./templates/Doc2.png",
    "3": "./templates/Doc3.png",
}

if __name__ == "__main__":
    sorted_itinerary = sys.argv[1]
    template_idx = sys.argv[2]

    formatted_itinerary = format_itinerary(sorted_itinerary)

    template_path = TEMPLATES.get(template_idx)
    itineray_path = overlay_text_on_template(formatted_itinerary, template_path)

    print(json.dumps({"image_path": os.path.abspath(itineray_path)}))