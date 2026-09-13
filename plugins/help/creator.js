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
// plugins/help/creator.js

import { buildCreatorContactMessage } from '../../lib/creatorInfo.js'

export default {
  command: 'creator',
  alias: ['dev', 'developer'],
  category: 'help',
  description: 'Menampilkan kontak (vCard) pembuat/creator bot.',
  typing: true,

  async execute(m) {
    await m.reply(buildCreatorContactMessage('(Creator)'))
  }
}
