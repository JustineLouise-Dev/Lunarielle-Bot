// Copyright (c) 2026 Justine Louise.
// Created by Justine Louise.
//
// This software is provided for personal and educational use only.
// Commercial use, resale, or distribution for profit is strictly prohibited
// without prior written permission from the author.
//
// Please respect the developer's work.
// Do not remove or modify this copyright notice or claim this project as your own.
//
// © 2026 Justine Louise. All Rights Reserved.
// ® Powered By Zapo-js
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImageThumbnail = generateImageThumbnail;
exports.generateStickerThumbnail = generateStickerThumbnail;

async function readImage(input) {
    const { Jimp } = await import('jimp');
    if (input instanceof Uint8Array || typeof input === 'string') {
        return Jimp.read(input);
    }
    const chunks = [];
    for await (const chunk of input) chunks.push(chunk);
    return Jimp.read(Buffer.concat(chunks));
}

function fitInside(img, maxEdge) {
    const { width, height } = img.bitmap;
    if (width <= maxEdge && height <= maxEdge) return img;
    if (width >= height) return img.resize({ w: maxEdge });
    return img.resize({ h: maxEdge });
}

async function generateImageThumbnail(input, maxEdge, quality) {
    const img = await readImage(input);
    fitInside(img, maxEdge);
    const data = await img.getBuffer('image/jpeg', { quality: quality ?? 70 });
    return {
        jpegThumbnail: new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
        width: img.bitmap.width,
        height: img.bitmap.height
    };
}

async function generateStickerThumbnail(input, maxEdge) {
    const img = await readImage(input);
    fitInside(img, maxEdge);
    const data = await img.getBuffer('image/png');
    return {
        pngThumbnail: new Uint8Array(data.buffer, data.byteOffset, data.byteLength),
        width: img.bitmap.width,
        height: img.bitmap.height
    };
}
