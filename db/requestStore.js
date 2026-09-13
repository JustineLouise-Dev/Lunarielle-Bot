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
// db/requestStore.js

import crypto from 'crypto'
import { createJsonStore } from './jsonStore.js'

const store = createJsonStore('requests.json', 'id')

function genId() {
  return `req_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`
}

export function createRequest({ jid, chatJid, pushName, phone, text }) {
  const id = genId()
  const request = {
    id,
    jid,
    phone: phone || String(jid || '').split('@')[0],
    chatJid: chatJid || jid,
    pushName: pushName || String(jid || '').split('@')[0],
    text: String(text || '').trim(),
    status: 'pending',
    createdAt: Date.now(),
    decidedAt: null,
    decidedBy: null
  }

  store.set(id, request)
  return request
}

export function getRequest(id) {
  return store.get(id)
}

export function listRequests({ status } = {}) {
  let out = store.all()
  if (status) out = out.filter((r) => r.status === status)
  return out.sort((a, b) => b.createdAt - a.createdAt)
}

export function listRequestsByJid(jid) {
  return store.all()
    .filter((r) => r.jid === jid)
    .sort((a, b) => b.createdAt - a.createdAt)
}

export function decideRequest(id, status, decidedBy = 'owner') {
  if (!['accepted', 'rejected'].includes(status)) return null
  const request = store.get(id)
  if (!request) return null

  request.status = status
  request.decidedAt = Date.now()
  request.decidedBy = decidedBy

  store.set(id, request)
  return request
}

export function deleteRequest(id) {
  return store.delete(id)
}

export function countByStatus() {
  const all = store.all()
  return {
    total: all.length,
    pending: all.filter((r) => r.status === 'pending').length,
    accepted: all.filter((r) => r.status === 'accepted').length,
    rejected: all.filter((r) => r.status === 'rejected').length
  }
}
