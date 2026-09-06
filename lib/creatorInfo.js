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
// lib/creatorInfo.js

export const CREATOR_CONTACTS = Object.freeze([
  Object.freeze({
    name: 'JustineLouise',
    number: '6282245186794'
  })

])

function toVcard(name, number) {
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name}`,
    `TEL;type=CELL;type=VOICE;waid=${number}:+${number}`,
    'END:VCARD'
  ].join('\n')
}

export function buildCreatorContactMessage(labelSuffix = '') {
  const contacts = CREATOR_CONTACTS.map(({ name, number }) => ({
    displayName: labelSuffix ? `${name} ${labelSuffix}` : name,
    vcard: toVcard(name, number)
  }))

  if (contacts.length === 1) {
    return { contactMessage: contacts[0] }
  }

  return {
    contactsArrayMessage: {
      displayName: `${contacts.length} Kontak Owner`,
      contacts
    }
  }
}
