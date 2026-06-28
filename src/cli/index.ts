#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { MarkdownToWeChat } from '../core/converter';
import { loadConfig, saveConfig, initConfig, getConfigPath } from '../config';

const program = new Command();
const converter = new MarkdownToWeChat();

program
  .name('md2wechat')
  .description('Markdown 转微信公众号 HTML 并发布到草稿箱')
  .version('1.0.0');

program
  .command('init')
  .description('初始化配置文件')
  .action(() => {
    const config = initConfig();
    console.log(chalk.green('✓ 配置文件已创建: ' + getConfigPath()));
    console.log(chalk.yellow('请编辑配置文件，填入微信公众号 AppID 和 AppSecret'));
  });

program
  .command('config [appid] [secret]')
  .description('配置微信公众号凭证')
  .option('--theme <theme>', '默认主题')
  .action((appid, secret, options) => {
    const current = loadConfig();
    const updates: any = {};

    if (appid || secret) {
      updates.wechat = {
        appId: appid || current.wechat.appId,
        appSecret: secret || current.wechat.appSecret,
      };
    }
    if (options.theme) {
      updates.theme = options.theme;
    }

    if (Object.keys(updates).length > 0) {
      const config = saveConfig(updates);
      console.log(chalk.green('✓ 配置已更新'));
      console.log(`  配置文件: ${getConfigPath()}`);
      console.log(`  AppID: ${maskString(config.wechat.appId)}`);
      console.log(`  AppSecret: ${maskString(config.wechat.appSecret)}`);
      console.log(`  默认主题: ${config.theme}`);
    } else {
      console.log(chalk.bold('当前配置:'));
      console.log(`  配置文件: ${getConfigPath()}`);
      console.log(`  AppID: ${maskString(current.wechat.appId) || '(未设置)'}`);
      console.log(`  AppSecret: ${maskString(current.wechat.appSecret) || '(未设置)'}`);
      console.log(`  默认主题: ${current.theme}`);
      console.log('');
      console.log(chalk.gray('设置凭证: md2wechat config <appid> <secret>'));
    }
  });

program
  .command('themes')
  .description('列出可用主题')
  .action(() => {
    const themes = converter.listThemes();
    console.log(chalk.bold('可用主题:'));
    themes.forEach(theme => {
      console.log(`  ${chalk.cyan(theme.id)} - ${theme.name}`);
    });
  });

program
  .command('inspect <file>')
  .description('检查 Markdown 文件元数据和发布状态')
  .action(async (file) => {
    const result = await converter.inspect(file);
    if (!result.success) {
      console.error(chalk.red('✗ ' + result.error));
      process.exit(1);
    }
    console.log(chalk.bold('文章信息:'));
    console.log(JSON.stringify(result.data, null, 2));
  });

program
  .command('convert <file>')
  .description('转换 Markdown 为公众号 HTML')
  .option('-t, --theme <theme>', '使用指定主题')
  .option('-o, --output <file>', '输出 HTML 文件')
  .option('-p, --preview', '浏览器预览')
  .option('-u, --upload-images', '上传图片到微信素材库')
  .option('-c, --cover <file>', '封面图片路径')
  .option('-d, --draft', '创建微信草稿')
  .action(async (file, options) => {
    const config = loadConfig();
    if (config.wechat.appId && config.wechat.appSecret) {
      converter.setWeChatConfig(config.wechat);
    }

    const result = await converter.convert(file, options);
    if (!result.success) {
      console.error(chalk.red('✗ ' + result.error));
      process.exit(1);
    }

    if (options.draft) {
      console.log(chalk.green('✓ 草稿创建成功!'));
      console.log(`  标题: ${result.data.title}`);
      console.log(`  Media ID: ${result.data.mediaId}`);
      console.log(`  图片数: ${result.data.images}`);
      console.log(chalk.yellow('\n请登录微信公众平台在草稿箱中查看和发布文章'));
    } else if (options.output) {
      console.log(chalk.green(`✓ HTML 已保存到: ${options.output}`));
    } else if (options.preview) {
      console.log(chalk.green('✓ 已在浏览器中打开预览'));
    } else {
      console.log(chalk.green('✓ 转换成功!'));
      console.log(`  主题: ${result.data.theme}`);
      console.log(`  标题: ${result.data.meta.title}`);
      console.log(`  图片数: ${result.data.images.length}`);
    }
  });

program
  .command('web')
  .description('启动可视化Web界面')
  .option('-p, --port <port>', '端口号', '3000')
  .option('--no-open', '不自动打开浏览器')
  .action(async (options) => {
    const port = parseInt(options.port, 10) || 3000;
    const { startWebServer } = await import('../web/server');
    await startWebServer(port);
    if (options.open !== false) {
      const open = (await import('open')).default;
      await open(`http://localhost:${port}`);
    }
  });

function maskString(s: string): string {
  if (!s) return '';
  if (s.length <= 8) return s.slice(0, 2) + '****' + s.slice(-2);
  return s.slice(0, 4) + '****' + s.slice(-4);
}

program.parse();
