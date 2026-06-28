import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { AppConfig } from '../types';

const CONFIG_DIR = path.join(os.homedir(), '.md2wechat');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

const defaultConfig: AppConfig = {
  wechat: {
    appId: '',
    appSecret: '',
  },
  theme: 'default',
  outputDir: './output',
};

export function loadConfig(): AppConfig {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return { ...defaultConfig };
    }
    const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
    const saved = JSON.parse(content);
    return { ...defaultConfig, ...saved };
  } catch (err) {
    return { ...defaultConfig };
  }
}

export function saveConfig(config: Partial<AppConfig>): AppConfig {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  const current = loadConfig();
  const merged = { ...current, ...config };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

export function initConfig(): AppConfig {
  if (fs.existsSync(CONFIG_FILE)) {
    return loadConfig();
  }
  return saveConfig(defaultConfig);
}

export function getConfigPath(): string {
  return CONFIG_FILE;
}
