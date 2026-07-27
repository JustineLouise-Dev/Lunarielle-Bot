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
import chalk from 'chalk';

// ── Badge tag ─────────────────────────────────────────────────────────
const B = {
  msg   : chalk.bgGray.white('  MSG  '),
  cmd   : chalk.bgCyan.black('  CMD  '),
  reply : chalk.bgMagenta.white(' REPLY '),
  sys   : chalk.bgBlue.white('  SYS  '),
  ok    : chalk.bgGreen.black(' ✓ OK  '),
  err   : chalk.bgRed.white(' ✗ ERR '),
  na    : chalk.bgYellow.black('  404  '),
  load  : chalk.bgWhite.black(' LOAD  '),
  reload: chalk.bgYellow.black(' RELOAD'),
  skip  : chalk.bgYellow.black(' SKIP  '),
  warn  : chalk.bgYellow.black(' WARN  '),
};

const _ts = () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return chalk.gray(`[${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}]`);
};

const _typeLog = (jid, groupName = null) => {
  if (!jid) return chalk.gray('? Unknown');
  if (jid.endsWith('@newsletter')) return chalk.yellow('⊠ Channel');
  if (jid.endsWith('@g.us')) {
    const id = jid.split('@')[0];
    if (groupName) {
      const display = groupName.length > 22 ? groupName.slice(0, 22) + '…' : groupName;
      return chalk.blue('⊞ ') + chalk.blue.bold(display) + ' ' + chalk.gray(`(${id})`);
    }
    return chalk.blue('⊞ Group');
  }
  return chalk.magenta('⊟ Private');
};

const _who = (jid, pushName = null) => {
  const id = String(jid || '').split('@')[0];
  const name = pushName ? chalk.bold.white(pushName) + ' ' : '';
  return `${name}${chalk.gray(`(${id})`)}`;
};

const _clip = (text, max = 55) => {
  const t = String(text ?? '');
  return chalk.italic.gray(`"${t.length > max ? t.slice(0, max) + '…' : t}"`);
};

const DIV    = chalk.gray('─'.repeat(70));
const INDENT = '              ';

export const richLog = {
  message(jid, pushName, text, groupName = null) {
    console.log(DIV);
    console.log(`${_ts()} ${B.msg} ${_typeLog(jid, groupName)}  ${_who(jid, pushName)}`);
    console.log(`${INDENT}${chalk.gray('└─')} ${_clip(text)}`);
  },
  
  cmd(jid, pushName, cmd, text, groupName = null) {
    console.log(DIV);
    console.log(
      `${_ts()} ${B.cmd} ${_typeLog(jid, groupName)}  ${_who(jid, pushName)} ` +
      `${chalk.gray('›')} ${chalk.cyan.bold(cmd)}`
    );
    console.log(`${INDENT}${chalk.gray('└─')} ${_clip(text)}`);
  },
  
  success(jid, pushName, cmd, groupName = null) {
    console.log(
      `${INDENT}${chalk.gray('↳')} ${B.ok} ${chalk.gray('selesai:')} ${chalk.cyan.bold(cmd)}`
    );
  },
  
  notFound(jid, pushName, cmd, groupName = null) {
    console.log(DIV);
    console.log(
      `${_ts()} ${B.cmd} ${_typeLog(jid, groupName)}  ${_who(jid, pushName)} ` +
      `${chalk.gray('›')} ${chalk.cyan.bold(cmd)}  ${B.na}`
    );
  },
  
  error(jid, pushName, cmd, errMsg, groupName = null) {
    console.log(
      `${INDENT}${chalk.gray('↳')} ${B.err} ${chalk.red(cmd + ':')} ${chalk.red(errMsg)}`
    );
  },
  
  reply(to, content, groupName = null) {
    const text = typeof content === 'string'
      ? content
      : content?.text ?? content?.caption ?? '[media/non-text]';

    let target;
    if (to.endsWith('@newsletter')) {
      const display = groupName ?? to.split('@')[0];
      target = chalk.yellow(display.length > 20 ? display.slice(0, 20) + '…' : display);
    } else if (to.endsWith('@g.us')) {
      const display = groupName ?? to.split('@')[0];
      target = chalk.blue(display.length > 20 ? display.slice(0, 20) + '…' : display);
    } else {
      target = chalk.magenta(to.split('@')[0]);
    }

    console.log(
      `${INDENT}${chalk.gray('↳')} ${B.reply} ${chalk.gray('→')} ${target}  ${_clip(text, 45)}`
    );
  },
  
  pluginLoaded(name, relPath) {
    console.log(chalk.green(`${B.load} ${chalk.green.bold(name)} ${chalk.gray(`(${relPath})`)}`));
  },
  
  loaded(count, total) {
    console.log(DIV);
    console.log(
      `${_ts()} ${B.load}  ${chalk.green('✅')} ` +
      `${chalk.green.bold(`${count}/${total} plugin berhasil dimuat`)}`
    );
    console.log(DIV);
  },
  
  reloaded(relPath) {
    console.log(`${_ts()} ${B.reload}  ${chalk.yellow('🔄')} ${chalk.yellow.bold(relPath)}`);
  },
  
  skip(msg) {
    console.log(`${_ts()} ${B.skip}  ${chalk.yellow(msg)}`);
  },
  
  warn(msg) {
    console.log(`${_ts()} ${B.warn}  ${chalk.yellow(msg)}`);
  },
  
  sys(msg) {
    console.log(`${_ts()} ${B.sys}  ${chalk.blue(msg)}`);
  },
};

export default richLog;
