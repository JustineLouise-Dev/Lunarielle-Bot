/*
 * Copyright (c) 2026 Justine Louise.
 * Created by Justine Louise.
 *
 * This software is provided for personal and educational use only.
 * Commercial use, resale, or distribution for profit is strictly prohibited
 * without prior written permission from the author.
 *
 * Please respect the developer's work.
 * Do not remove or modify this copyright notice or claim this project as your own.
 *
 * © 2026 Justine Louise. All Rights Reserved.
 */
function makeInjectContext(config) {
  const nf = config.newsletterForward || {};
  if (!nf.enabled) {
    return () => {}; // no-op kalau newsletter forward dimatikan
  }

  const newsletterInfo = {
    newsletterJid: nf.newsletterJid,
    newsletterName: nf.newsletterName,
    serverMessageId: nf.serverMessageId,
  };

  return (ctx) => {
    if (!ctx || typeof ctx !== 'object') return;
    ctx.forwardedNewsletterMessageInfo = newsletterInfo;
    ctx.forwardingScore = 19;
    ctx.isForwarded = true;
  };
}

function makeInjectButtons(config) {
  const newButtons = [];

  if (config.autoMenuShortcutButtons === true) {
    newButtons.push({
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({ display_text: '📜 Menu', id: 'menu_shortcut:menu' }),
    });
    newButtons.push({
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({ display_text: '👤 Owner', id: 'menu_shortcut:owner' }),
    });
  }

  return (nativeFlow) => {
    if (!nativeFlow || typeof nativeFlow !== 'object') return;
    if (newButtons.length === 0) return;

    let buttons = nativeFlow.buttons || [];

    const filteredNew = newButtons.filter((nb) => {
      let nbObj = JSON.parse(nb.buttonParamsJson);
      return !buttons.some((b) => {
        if (!b.buttonParamsJson) return false;
        try {
          let bObj = JSON.parse(b.buttonParamsJson);
          if (nb.name === 'quick_reply') return bObj.id === nbObj.id;
          return bObj.url === nbObj.url || bObj.display_text === nbObj.display_text;
        } catch (e) {
          return nbObj.url && b.buttonParamsJson.includes(nbObj.url);
        }
      });
    });

    if (filteredNew.length > 0) {
      if (buttons[0] && buttons[0].name === 'single_select') {
        buttons.splice(1, 0, ...filteredNew);
      } else {
        buttons.push(...filteredNew);
      }
    }
    nativeFlow.buttons = buttons;

    if (nativeFlow.messageParamsJson) {
      try {
        let params =
          typeof nativeFlow.messageParamsJson === 'string'
            ? JSON.parse(nativeFlow.messageParamsJson)
            : nativeFlow.messageParamsJson;

        if (params.bottom_sheet) {
          params.bottom_sheet.in_thread_buttons_limit = 5;
          nativeFlow.messageParamsJson = JSON.stringify(params);
        }
      } catch (e) {}
    }
  };
}

export function buildGroupPromoAdReply(config) {
  const links = config.links || {};
  if (!links.groupUrl) return null;

  return {
    title: config.botName || 'Gabung Grup',
    body: 'Klik untuk gabung grup WhatsApp resmi kami',
    mediaType: 1,
    thumbnailUrl: links.groupPromoImageUrl || undefined,
    sourceUrl: links.groupUrl,
    renderLargerThumbnail: true,
    showAdAttribution: false,
  };
}

function buildInteractiveBinaryNodes(jid) {
  const isGroup = typeof jid === 'string' && (jid.endsWith('@g.us') || jid.endsWith('@broadcast'));

  const bizNode = {
    tag: 'biz',
    attrs: {},
    content: [
      {
        tag: 'interactive',
        attrs: { type: 'native_flow', v: '1' },
        content: [
          {
            tag: 'native_flow',
            attrs: { v: '9', name: 'mixed' },
          },
        ],
      },
    ],
  };

  if (isGroup) return [bizNode];
  
  const botNode = { tag: 'bot', attrs: { biz_bot: '1' } };
  return [bizNode, botNode];
}

export function installRelayInjection(Exp, config) {
  const injectContext = makeInjectContext(config);
  const injectButtons = makeInjectButtons(config);
  const rawRelayMessage = Exp.relayMessage.bind(Exp);
  
  const injectFooterText = `Created by ${config.creatorName || config.ownerName}`;

  Exp.relayMessage = async (id, message, options) => {
    try {
      let mtype = Object.keys(message)[0];
      let isViewOnce = mtype === 'viewOnceMessage';
      let root = isViewOnce ? message.viewOnceMessage.message : message;
      let type = Object.keys(root)[0];
      let content = root[type];
      
      if (type === 'protocolMessage') {
        return rawRelayMessage(id, message, options);
      }
      
      if (type === 'interactiveMessage') {
        injectContext((content.contextInfo ??= {}));
      } else if (content && typeof content === 'object') {
        injectContext((content.contextInfo ??= {}));
      } else if (typeof content === 'string') {
        root.extendedTextMessage = { text: content, contextInfo: {} };
        injectContext(root.extendedTextMessage.contextInfo);
        delete root.conversation;
        type = 'extendedTextMessage';
        content = root.extendedTextMessage;
      }
      
      const transmissibleTypes = ['conversation', 'extendedTextMessage', 'imageMessage', 'videoMessage', 'documentMessage'];

      if (type === 'interactiveMessage') {
        if (content.nativeFlowMessage) injectButtons(content.nativeFlowMessage);
        if (content.carouselMessage?.cards) {
          for (let card of content.carouselMessage.cards) {
            if (card.nativeFlowMessage) injectButtons(card.nativeFlowMessage);
          }
        }
      } else if (transmissibleTypes.includes(type) && !id.endsWith('@newsletter')) {
        let text = content.text || content.caption || content.conversation || '';
        let isMedia = /image|video|document/.test(type);
        let contextInfo = content.contextInfo || {};

        let interactive = {
          header: {
            ...(isMedia ? { hasMediaAttachment: true, [type]: content } : {}),
          },
          body: { text },
          footer: { text: injectFooterText },
          nativeFlowMessage: { buttons: [] },
          contextInfo,
        };

        injectButtons(interactive.nativeFlowMessage);

        if (isViewOnce) {
          message.viewOnceMessage.message = { interactiveMessage: interactive };
        } else {
          delete root[type];
          message.interactiveMessage = interactive;
        }
      }
      
      const finalRoot = isViewOnce ? message.viewOnceMessage.message : message;
      const finalHasInteractive = !!finalRoot.interactiveMessage;

      if (finalHasInteractive) {
        const extraNodes = buildInteractiveBinaryNodes(id);
        options = {
          ...options,
          additionalNodes: [...(options?.additionalNodes || []), ...extraNodes],
        };
      }

      return await rawRelayMessage(id, message, options);
    } catch (e) {
      console.error('Error in Exp.relayMessage wrapper (lib/relayInjection.js):', e);
      return rawRelayMessage(id, message, options);
    }
  };
}

export function installSendMessageOverride(Exp, { generateWAMessageContent, generateMessageIDV2, getContentType }) {
  const rawSendMessage = Exp.sendMessage.bind(Exp);

  Exp.sendMessage = async (id, content, etc = {}) => {
    try {
      let mtype = getContentType(content);
      
      const isPTT = content?.ptt === true;
      const isAudio = !!content?.audio;
      if (
        mtype === 'protocolMessage' ||
        content?.delete ||
        content?.edit ||
        isPTT ||
        isAudio ||
        mtype === 'stickerMessage' ||
        mtype === 'contactMessage' ||
        mtype === 'contactsArrayMessage'
      ) {
        return rawSendMessage(id, content, etc);
      }

      let message = await generateWAMessageContent(content, { upload: Exp.waUploadToServer });
      let type = getContentType(message);

      if (etc.quoted) {
        message[type].contextInfo = {
          ...message[type].contextInfo,
          stanzaId: etc.quoted.key.id,
          participant: etc.quoted.key.participant || etc.quoted.key.remoteJid,
          quotedMessage: etc.quoted.message || etc.quoted,
          mentionedJid: content.mentionedJid || content.mentions || [],
        };
      }

      const msgId = generateMessageIDV2(Exp.user.id);
      await Exp.relayMessage(id, message, { messageId: msgId });
      return { key: { id: msgId, fromMe: true, remoteJid: id } };
    } catch (e) {
      console.error('Error in Exp.sendMessage override (lib/relayInjection.js):', e);
      return rawSendMessage(id, content, etc);
    }
  };
}
