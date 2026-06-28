---
title: 如何使用 md2wechat 发布公众号文章
author: 技术小编
digest: 一个简单易用的 Markdown 转微信公众号工具
theme: default
---

# 如何使用 md2wechat 发布公众号文章

欢迎使用 **md2wechat**！这是一个可以将 Markdown 文档快速转换为微信公众号 HTML 格式的命令行工具。

## 功能特性

- ✅ Markdown 语法全支持
- ✅ 代码语法高亮
- ✅ 多种精美主题
- ✅ 图片自动上传
- ✅ 一键发布草稿箱

## 快速开始

### 1. 初始化配置

首先，你需要初始化配置文件：

```bash
md2wechat init
```

然后编辑配置文件，填入你的微信公众号 AppID 和 AppSecret。

### 2. 预览文章

使用 preview 命令在浏览器中预览效果：

```bash
md2wechat convert article.md --preview
```

### 3. 发布草稿

确认无误后，使用 `--draft` 参数直接发布到草稿箱：

```bash
md2wechat convert article.md --draft --cover cover.jpg
```
