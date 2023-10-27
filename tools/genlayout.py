from bs4 import BeautifulSoup

SCALE = 1.0

def readsvg(filename):
    with open(filename) as fp:
        soup = BeautifulSoup(fp, features="xml")

    result = []
    for group in ['Regions', 'States']:
        boxes = soup.find('g', id=group)
        for box in boxes.find_all('g', recursive=False):
            name = box.attrs['id']
            rect = box.find('rect')
            x = float(rect.attrs['x'])
            y = float(rect.attrs['y'])
            w = float(rect.attrs['width'])
            h = float(rect.attrs['height'])
            xc = round((x+w/2.0)*SCALE)
            yc = round((y+h/2.0)*SCALE)
            result.append([name, xc, yc])

    return result

def print_list(data):
    print("const LAYOUT = {")
    for (name, x, y) in data:
        print(f'\t"{name}": [{x}, {y}],')
    print("}")

result = readsvg("tools/layout.svg")
print_list(result)
