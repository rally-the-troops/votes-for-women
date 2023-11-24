#!/bin/bash

mkdir -p HIRES/cards800 cards200 cards100

# gs -r600 -sDEVICE=png16m -o map600.png HIRES/map-no-tex.pdf
# gs -r600 -sDEVICE=png16m -o map600-tex.png HIRES/map-only-tex.pdf
convert -colorspace RGB -resize 12.5% -colorspace sRGB map600.png map-uncrop.png
convert -colorspace RGB -resize 12.5% -colorspace sRGB map600-tex.png map-tex-uncrop.png
convert -gravity Center -crop 1650x1275+0+0 map-uncrop.png map.png
convert -gravity Center -crop 1650x1275+0+0 map-tex-uncrop.png map-texture.png

exit

gs -dUseArtBox -r800 -sDEVICE=png16m -o HIRES/cards800/strategy_%02d.png "HIRES/Strategy Cards FINAL-4.pdf"
gs -dUseArtBox -r800 -sDEVICE=png16m -o HIRES/cards800/states_%02d.png "HIRES/States FINAL-3.pdf"
gs -dUseArtBox -r800 -sDEVICE=png16m -o HIRES/cards800/support_%02d.png "HIRES/Support Cards FINAL-6.pdf"
gs -dUseArtBox -r800 -sDEVICE=png16m -o HIRES/cards800/opposition_%02d.png "HIRES/Opposition Cards FINAL-4_2 PANDA.pdf"

for F in HIRES/cards800/*.png
do
	B=$(basename $F)
	echo $B
	convert -colorspace RGB -resize 12.5% -colorspace sRGB $F cards100/$B
	convert -colorspace RGB -resize 25% -colorspace sRGB $F cards200/$B
done
