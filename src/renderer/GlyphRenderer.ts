const opentype = require('opentype.js');

export class GlyphRenderer {

    readonly fontSize: number;

    font: any;
    glyphs: any[] = [];
    glyphFontPositions: Float32Array | null = null;
    rowsPerPage = 0;
    rowHeight = 0;
    baselineOffset = 0;
    glyphTextures: Uint8Array[] = [];
    glyphOffsets: number[] = [];

    constructor(fontSize: number, url: string, padding: number, callback: (error: any) => void) {
        this.fontSize = fontSize;
        opentype.load(url, (error: any, font: any) => {
            if (error) {
                callback(error);
            } else {
                this.font = font;
                const keys = Object.keys(font.glyphs.glyphs);
                this.glyphs = new Array(keys.length);
                for (var index in font.glyphs.glyphs) {
                    const glyph = font.glyphs.glyphs[index];
                    this.glyphs[glyph.index] = font.glyphs.glyphs[index];
                }
                this.renderGlyphs(padding);
                callback(null);
            }
        })
    }

    renderGlyphs = (padding: number): void => {
        var canvas = document.createElement("canvas");
        canvas.width = 1024;
        canvas.height = 1024;
        var ctx = canvas.getContext("2d", { alpha: false })!;
        
        const scale = this.fontSize / this.font.unitsPerEm;
        const ascender = this.font.ascender * scale;
        const descender = -this.font.descender * scale;
        const height = ascender + descender + padding * 2;

        this.rowHeight = height / 1024;
        this.rowsPerPage = Math.floor(1024 / height);
        this.baselineOffset = (ascender + padding) / 1024;

        var x = 0;
        var row = 0;

        this.glyphFontPositions = new Float32Array(this.glyphs.length * 3);

        for (var i = 0; i < this.glyphs.length; i++) {
            const glyph = this.glyphs[i];
            const boundingBox = glyph.getBoundingBox();
            const glyphX = -boundingBox.x1 * scale + padding;
            const width = (boundingBox.x2 - boundingBox.x1) * scale + padding * 2;
            if (x + width > 1024) {
                x = 0;
                row += 1;
                if (row % this.rowsPerPage === 0) {
                    this.storeCanvas(ctx);
                    ctx.clearRect(0, 0, 1024, 1024);
                }
            }
            const y = (row % this.rowsPerPage) * height;
            var path = this.glyphs[i].getPath(x + glyphX, y + ascender + padding, this.fontSize);
            path.fill = "white";
            path.draw(ctx);

            this.glyphFontPositions[i * 3] = row;
            this.glyphFontPositions[i * 3 + 1] = x / 1024;
            this.glyphFontPositions[i * 3 + 2] = width / 1024;

            this.glyphOffsets.push(glyphX);

            x += width;
        }

        this.storeCanvas(ctx);
    }

    private storeCanvas = (ctx: CanvasRenderingContext2D) => {
        const data = ctx.getImageData(0, 0, 1024, 1024).data!;
        const alphaChannel = new Uint8Array(1024 * 1024);
        for (var i = 0; i < 1024 * 1024; i += 1) {
            alphaChannel[i] = data[i * 4];
        }
        this.glyphTextures.push(alphaChannel);
    }

    renderText = (node: number, line: number, text: string, buffer: number[]): void => {
        const scale = this.fontSize / (this.font.unitsPerEm * 1024);

        const glyphs = this.font.stringToGlyphs(text);

        // Calculate the total width for this text
        var totalWidth = 0;
        for (var i = 0; i < glyphs.length; i++) {
            totalWidth += glyphs[i].advanceWidth;
        }

        // Calculate the horizontal start offset so that the text is centered
        var start = totalWidth * -0.5 * scale;
        
        // Append each glyph to the provided buffer
        for (i = 0; i < glyphs.length; i++) {
            const glyph = glyphs[i];
            buffer.push(glyph.index);
            buffer.push(node);
            buffer.push(start - this.glyphOffsets[glyph.index] / 1024);
            buffer.push(line);
            start += glyph.advanceWidth * scale;
        }
    }
}