# Make highlight textures.
#

from PIL import Image, ImageDraw, ImageColor

def make_torus_colors():
    """Make a color wheel textUre for the node highlighting torus.

    The top half contains the colors, the bottom half is transparent.
    """

    N = 180
    img = Image.new('RGBA', (N, N), (0, 0, 0, 1))
    draw = ImageDraw.Draw(img)

    # Draw a color wheel across the top half of the square.
    # The bottom half stays behind the billboarded torus.
    #
    for i in range(N):
        hue = i*2
        hsl = f'hsl({hue}, 100%, 50%)'
        color = ImageColor.getrgb(hsl)
        # print(i, hsl, color)

        draw.rectangle([(i,0), (i+1,N//2)], fill=color)

    return img

def make_link_chunks(debug=False):
    """Make a texture for a rotating cylinder around links.

    We want to have solid pieces at each end, so the line is highlighted
    along its full length.

    The top half contains the colors, the bottom half is transparent.
    """

    def draw_rect1(draw, x, y, xsize, ysize, color):
        draw.rectangle([(x,y), (x+xsize,y+ysize)], fill=color)

    def draw_rect2(draw, x, y, xsize, ysize, color):
        draw.rectangle([(x,y), (x+xsize,y+ysize//4)], fill=color)
        draw.rectangle([(x,y+ysize*3//4), (x+xsize,y+ysize)], fill=color)

    bg = (0,0,0,255) if debug else (0,0,0,0)
    N = 256
    img = Image.new('RGBA', (N, N), bg)
    draw = ImageDraw.Draw(img)

    if debug:
        draw.line([(0,N//2), (N,N//2)], fill=(255,255,255,255))

    color = (0,0,255,255) if debug else (255,255,255,255)
    print(color)
    NS = 8
    xsize = N//NS
    ysize = xsize//2
    print(f'size={xsize},{ysize}')
    for x in range(NS):
        for y in range(NS):
            do_draw = (x%2==0 and y%2==0) or (x%2==1 and y%2==1)
            print('*' if do_draw else ' ', end='')
            if do_draw:
                xx = x*xsize
                yy = y*ysize
                draw_rect2(draw, xx, yy, xsize, ysize, color)

        print()

    return img

def make_link_helix(debug=False):
    """Make a texture that produces a helix.

    This is very cool, but the rotation makes it look as if there's a
    directional flow, which we don't want. Sad.
    """

    N = 256
    W = 16

    def helix(x0, y0, w):
        for y in range(N):
            x = int((y*2)/N*(N-w))

            x1 = x0+x
            yy = y0+y
            x2 = x0+x+w
            if x1>=N:
                return
            if yy>=N//2:
                x1 += w
                x2 += w
                yy -= N/2
            draw.line([(x1,yy), (x2,yy)], fill=color)

    bg = (0,0,0,255) if debug else (0,0,0,0)
    img = Image.new('RGBA', (N, N), bg)
    draw = ImageDraw.Draw(img)

    if debug:
        draw.line([(0,N//2), (N,N//2)], fill=(255,255,255,255))

    color = (0,0,255,255) if debug else (255,255,255,255)
    helix(0, 0, W)
    helix(0-W, N//4, W)
    helix(0-W, N//8, W)
    helix(0-W, 3*N//8, W)
    # helix(N//2, 0)
    # for y in range(N//2):
    #     x = int((y*2)/N*(N-W))
    #     draw.line([(x,y), (x+W,y)], fill=color)

    return img


if __name__=='__main__':
    img = make_torus_colors()
    img.save('highlight-texture.png')

    img = make_link_chunks()
    # img = make_link_helix()
    img.save('highlight-link-texture.png')
