inkscape --export-dpi=1920 -o d4.png tools/d4.svg
inkscape --export-dpi=1920 -o d6.png tools/d6.svg
inkscape --export-dpi=1920 -o d8.png tools/d8.svg
for F in d?.png
do
	convert -colorspace RGB -resize 6.25% -colorspace sRGB $F images/${F/.png/.1x.png}
	convert -colorspace RGB -resize 12.5% -colorspace sRGB $F images/${F/.png/.2x.png}
done
rm d4.png d6.png d8.png
