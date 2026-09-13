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
// db/trustedFeatures.js

import { createJsonStore } from './jsonStore.js'
import { getContactByJid } from './contacts.js'

const store = createJsonStore('trusted_features.json', 'key')

function recordKey(jid, command) {
  return `${jid}|${command}`
}

function hasDirectTrust(jid, command) {
  return Boolean(store.get(recordKey(jid, command)))
}

const CONTACT_MISS_TTL = 30_000
const contactMissCache = new Map()

function getCounterpart(jid) {
  const cachedUntil = contactMissCache.get(jid)
  if (cachedUntil && cachedUntil > Date.now()) return null

  const contact = getContactByJid(jid)
  if (!contact) {
    contactMissCache.set(jid, Date.now() + CONTACT_MISS_TTL)
    return null
  }

  contactMissCache.delete(jid)
  return contact.lid_jid === jid ? contact.pn_jid : contact.lid_jid
}

export function isTrustedFeature(jid, command) {
  if (!jid) return false
  if (hasDirectTrust(jid, command)) return true
  if (jid.endsWith('@g.us')) return false

  const other = getCounterpart(jid)
  return !!other && hasDirectTrust(other, command)
}

export function resolvePersonIdentifiers(jid) {
  const identifiers = new Set([jid])
  if (jid && !jid.endsWith('@g.us')) {
    const contact = getContactByJid(jid)
    if (contact?.lid_jid) identifiers.add(contact.lid_jid)
    if (contact?.pn_jid) identifiers.add(contact.pn_jid)
  }
  return [...identifiers]
}

export function addTrustedFeature(jid, command, addedBy = null) {
  const key = recordKey(jid, command)
  const already = Boolean(store.get(key))
  store.set(key, { key, jid, command, added_by: addedBy, created_at: Date.now() })
  return !already
}

export function addTrustedUser(jid, command, addedBy = null) {
  const identifiers = resolvePersonIdentifiers(jid)
  let added = false
  for (const id of identifiers) {
    if (addTrustedFeature(id, command, addedBy)) added = true
  }
  return { added, identifiers }
}

export function removeTrustedFeature(jid, command) {
  return store.delete(recordKey(jid, command))
}

export function removeTrustedUser(jid, command) {
  const identifiers = resolvePersonIdentifiers(jid)
  let removed = false
  for (const id of identifiers) {
    if (removeTrustedFeature(id, command)) removed = true
  }
  return { removed, identifiers }
}

export function getTrustedUserCommands(jid) {
  const found = new Set()
  for (const id of resolvePersonIdentifiers(jid)) {
    for (const record of store.all()) {
      if (record.jid === id) found.add(record.command)
    }
  }
  return found
}

export function removeGroupTrust(jid) {
  let removed = false
  for (const record of store.all()) {
    if (record.jid === jid) {
      store.delete(record.key)
      removed = true
    }
  }
  return removed
}

export function getTrustedFeatures() {
  const map = new Map()
  for (const record of store.all()) {
    if (!map.has(record.jid)) map.set(record.jid, new Set())
    map.get(record.jid).add(record.command)
  }
  return map
}
