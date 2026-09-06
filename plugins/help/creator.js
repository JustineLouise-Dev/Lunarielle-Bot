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
