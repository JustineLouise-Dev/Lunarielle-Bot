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
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { richLog } from '../lib/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PLUGINS_DIR = path.join(__dirname, '..', 'plugins');

class PluginHandler {
  #attachAllWatchers = () => {};

  constructor() {
    this.plugins = new Map();
    this.commandIndex = new Map();
    this.watchers = [];
  }
  
  #walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(this.#walk(full));
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        results.push(full);
      }
    }
    return results;
  }
  
  #folderTag(filePath) {
    const rel = path.relative(PLUGINS_DIR, filePath);
    const parts = rel.split(path.sep);
    return parts.length > 1 ? parts[0] : 'Uncategorized';
  }
  
  async loadPlugin(filePath, { silent = false } = {}) {
    try {
      const url = pathToFileURL(filePath).href + `?update=${Date.now()}`;
      const mod = await import(url);
      const plugin = mod.default || mod;

      if (!plugin || typeof plugin.execute !== 'function') {
        richLog.skip(`Plugin dilewati (tidak punya execute() valid): ${filePath}`);
        return false;
      }
      
      this.#unbindCommands(filePath);

      const commands = (plugin.command || []).map((c) => String(c).toLowerCase());
      const tags = plugin.tags && plugin.tags.length ? plugin.tags : [this.#folderTag(filePath)];

      const entry = {
        path: filePath,
        module: plugin,
        commands,
        meta: {
          name: plugin.name || path.basename(filePath, '.js'),
          description: plugin.description || '-',
          owner: !!plugin.owner,
          tags,
        },
      };

      this.plugins.set(filePath, entry);

      for (const cmd of commands) {
        if (this.commandIndex.has(cmd) && this.commandIndex.get(cmd) !== filePath) {
          richLog.warn(
            `Command "${cmd}" di ${filePath} bentrok dengan ${this.commandIndex.get(cmd)}, akan menimpa.`
          );
        }
        this.commandIndex.set(cmd, filePath);
      }

      if (!silent) {
        richLog.pluginLoaded(entry.meta.name, path.relative(PLUGINS_DIR, filePath));
      }
      return true;
    } catch (err) {
      richLog.warn(`Gagal memuat plugin: ${filePath}`);
      console.error(err);
      return false;
    }
  }

  #unbindCommands(filePath) {
    for (const [cmd, ownerPath] of this.commandIndex.entries()) {
      if (ownerPath === filePath) this.commandIndex.delete(cmd);
    }
  }

  unloadPlugin(filePath) {
    this.#unbindCommands(filePath);
    const existed = this.plugins.delete(filePath);
    if (existed) {
      richLog.sys(`Plugin di-unload: ${path.relative(PLUGINS_DIR, filePath)}`);
    }
    return existed;
  }

  async reloadPlugin(filePath) {
    richLog.reloaded(path.relative(PLUGINS_DIR, filePath));
    return this.loadPlugin(filePath);
  }
  
  async scanAll() {
    const files = this.#walk(PLUGINS_DIR);
    let ok = 0;
    for (const file of files) {
      const success = await this.loadPlugin(file, { silent: true });
      if (success) ok++;
    }
    richLog.loaded(ok, files.length);
    return ok;
  }
  
  watch() {
    if (!fs.existsSync(PLUGINS_DIR)) fs.mkdirSync(PLUGINS_DIR, { recursive: true });
    
    const watchDir = (dir) => {
      try {
        const watcher = fs.watch(dir, { persistent: true }, async (eventType, filename) => {
          if (!filename || !filename.endsWith('.js')) {
            this.#attachAllWatchers();
            return;
          }
          const fullPath = path.join(dir, filename);

          if (!fs.existsSync(fullPath)) {
            // deleted
            this.unloadPlugin(fullPath);
            return;
          }
          
          clearTimeout(this._debounce?.[fullPath]);
          this._debounce ??= {};
          this._debounce[fullPath] = setTimeout(async () => {
            const isNew = !this.plugins.has(fullPath);
            await this.loadPlugin(fullPath);
            if (isNew) {
              richLog.sys(`Plugin baru terdeteksi & dimuat: ${path.relative(PLUGINS_DIR, fullPath)}`);
            }
          }, 150);
        });
        this.watchers.push(watcher);
      } catch (err) {
        richLog.warn(`Watch error di ${dir}: ${err.message}`);
      }
    };

    this._watchedDirs = new Set();
    const watchDirTracked = (dir) => {
      if (this._watchedDirs.has(dir)) return;
      watchDir(dir);
      this._watchedDirs.add(dir);
    };

    this.#attachAllWatchers = () => {
      const dirs = [PLUGINS_DIR, ...this.#allDirs(PLUGINS_DIR)];
      for (const d of dirs) watchDirTracked(d);
    };

    this.#attachAllWatchers();
    
    this._pollTimer = setInterval(() => this.#reconcile(), 2000);

    richLog.sys('Hot reload aktif — memantau folder plugins/');
  }

  stopWatch() {
    for (const w of this.watchers) w.close();
    this.watchers = [];
    this._watchedDirs?.clear();
    if (this._pollTimer) clearInterval(this._pollTimer);
  }

  async #reconcile() {
    const filesOnDisk = new Set(this.#walk(PLUGINS_DIR));
    
    for (const file of filesOnDisk) {
      if (!this.plugins.has(file)) {
        const isNew = true;
        const ok = await this.loadPlugin(file, { silent: true });
        if (ok && isNew) {
          richLog.sys(`Plugin baru terdeteksi & dimuat: ${path.relative(PLUGINS_DIR, file)}`);
        }
      }
    }
    
    for (const trackedPath of [...this.plugins.keys()]) {
      if (!filesOnDisk.has(trackedPath)) {
        this.unloadPlugin(trackedPath);
      }
    }
    
    this.#attachAllWatchers();
  }

  #allDirs(dir) {
    let dirs = [];
    if (!fs.existsSync(dir)) return dirs;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const full = path.join(dir, entry.name);
        dirs.push(full);
        dirs = dirs.concat(this.#allDirs(full));
      }
    }
    return dirs;
  }
  
  findCommand(cmd) {
    const filePath = this.commandIndex.get(String(cmd).toLowerCase());
    if (!filePath) return null;
    return this.plugins.get(filePath) || null;
  }
  
  getMenuGrouped() {
    const grouped = {};
    for (const entry of this.plugins.values()) {
      for (const tag of entry.meta.tags) {
        grouped[tag] ??= [];
        if (!grouped[tag].some((p) => p.path === entry.path)) {
          grouped[tag].push({
            path: entry.path,
            name: entry.meta.name,
            description: entry.meta.description,
            owner: entry.meta.owner,
            commands: entry.commands,
          });
        }
      }
    }
    return grouped;
  }

  getAllPlugins() {
    return [...this.plugins.values()];
  }
}

export const handler = new PluginHandler();
export default handler;
