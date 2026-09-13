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
// db/groupSettings.js

import { createJsonStore } from './jsonStore.js'

const store = createJsonStore('group_settings.json', 'group_jid')

export function getGroupSettings(groupJid) {
    return store.get(groupJid)?.settings || {}
}

export function getGroupSetting(groupJid, key, defaultValue = false) {
    const settings = getGroupSettings(groupJid)
    return Object.prototype.hasOwnProperty.call(settings, key)
        ? settings[key]
        : defaultValue
}

export function setGroupSetting(groupJid, key, value) {
    const existing = store.get(groupJid)
    const settings = { ...(existing?.settings || {}), [key]: value }

    store.set(groupJid, { group_jid: groupJid, settings })

    return settings
}

export function listGroupsWithSetting(key) {
    return store.all()
        .filter(row => row.settings?.[key])
        .map(row => row.group_jid)
}

export function deleteGroupSettings(groupJid) {
    return store.delete(groupJid)
}

export function deleteGroupSetting(groupJid, key) {
    const existing = store.get(groupJid)
    if (!existing || !(key in (existing.settings || {}))) return false

    const settings = { ...existing.settings }
    delete settings[key]

    store.set(groupJid, { group_jid: groupJid, settings })
    return true
}
