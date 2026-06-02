# npm 发布不会错步合

## 【不会错】npm 发布步骤

此文档提供了完整步骤，保证你可以顺利发布 paste2md 到 npm。

### 阶段1：认证你的当前的位置

```bash
# 检查是否在项目根目录
cd paste2md

# 确保 package.json 存在
cat package.json | head -5

# 检查 git 状态
git status
```

**预期结果:**
```
On branch main
nothing to commit, working tree clean
```

---

### 阶段2：npm 账户检查

#### 2.1 检查是否已经登录

```bash
npm whoami
```

**预期结果:**
```
your-npm-username
```

#### 2.2 如果未登录，不要急着登录

如果是新账户或未登录，请先去 npm.com 注册：

1. 访问: https://www.npmjs.com/signup
2. 剁填信息
3. 验证邮箱
4. 然后执行: `npm login`

---

### 阶段3：运行发布前检查

```bash
# 运行所有测试
npm test

# 检查代码风格
npm run lint

# 检查 package.json 版本
node -p "require('./package.json').version"
```

**预期结果:**
```
✓ 所有测试通过
✓ 所有 lint 检查通过
1.0.0
```

---

### 阶段4：官方发布

#### 方案 A: 直接发布

```bash
# 发布到 npm
npm publish

# 等待 5-10 秒干残涗
echo "Waiting for npm registry to update..."
sleep 10

# 验证发布
npm view paste2md
```

**预期结果:**
```
✓ publish + 8 files

paste2md@1.0.0
```

#### 方案 B: 使用发布脚本 (推荐)

```bash
# 运行完整发布脚本
bash scripts/release.sh
```

脚本会自动：
1. 验证 npm 登录
2. 运行测试
3. 检查代码风格
4. 创建 Git 标签
5. 推送到 GitHub
6. 发布到 npm

---

### 阶段5：验证发布

#### 5.1 检查 npm 包

```bash
# 查看包信息
npm view paste2md

# 查看下载统计（划伤剪贴板后）
npm view paste2md downloads

# 查看最新版本
npm view paste2md@latest version
```

#### 5.2 检查 GitHub

```bash
# 查看 标签
git tag

# 查看 最近提交
git log --oneline -5
```

#### 5.3 检查 GitHub Pages

访问: https://lananh93159-boop.github.io/paste2md

---

### 阶段6：创建 GitHub Release

1. 访问: https://github.com/lananh93159-boop/paste2md/releases
2. 点击 "Create a new release"
3. 选择标签: `v1.0.0`
4. 文档题: `Release 1.0.0`
5. 文档描述:

```markdown
## 🎉 paste2md v1.0.0

首次正式发布！

### ✨ 新特性
- HTML 转换为 Markdown
- 自动騎袭去除（脚本、样式、cookies）
- 跨平台支持（macOS, Linux, Windows/WSL）
- 80+ 综合测试
- GitHub Actions CI/CD

### 💪 优化
- 戴体上优化的 CLI
- 改进的 HTML 清理
- 改进的错误处理

### 📚 文档
- [README](https://github.com/lananh93159-boop/paste2md)
- [npm Package](https://www.npmjs.com/package/paste2md)
- [GitHub Pages](https://lananh93159-boop.github.io/paste2md)

感谢你的支持！🙋
```

6. 点击 "Publish release"

---

### 阶段7：最终验证

#### 7.1 从希小罐安装

```bash
# 方案 1: 全局安装
npm install -g paste2md

# 方案 2: 空水运行
npx paste2md --version

# 方案 3: 查看帮助
npx paste2md --help
```

#### 7.2 测试使用

```bash
# 整理简单的 HTML
echo '<h1>Hello</h1><p>World</p>' | npx paste2md

# 预期结果
# # Hello
#
# World
```

#### 7.3 检查 npm 下载量

```bash
# 等待 24 小时，然后 npm 来自动更新统计。
# 访问: https://www.npmjs.com/package/paste2md
```

---

## ✅ 检查清单

```markdown
发布前:
☐ npm whoami - 已登录
☐ npm test - 所有测试通过
☐ npm run lint - 代码风格检查
☐ git status - 工作树干净
☐ package.json 版本 = 1.0.0

发布:
☐ npm publish 成功
☐ npm view paste2md 可以查看
☐ Git 标签 v1.0.0 创建
☐ GitHub Release 发布

验证:
☐ npx paste2md --version 工作
☐ npx paste2md --help 不会错
☐ GitHub Pages 可访问
☐ npm 下载量水涧了
```

---

## ⚠️ 常见错误修复

### 错误 1: "npm ERR! code E401 Unauthorized"

**原因:** npm 未登录

**解决:**
```bash
npm login
# 输入用户名、密码、电子邮件
```

### 错误 2: "npm ERR! code EPERM"

**原因:** 权限问题

**解决:**
```bash
# 使用 sudo 或修复 npm 权限
 sudo npm publish  # 不推荐

# 更好的方案：使用 nvm
```

### 错误 3: "This publish would overwrite"

**原因:** 包已存在

**解决:**
```bash
# 更新版本号
node -p "require('./package.json').version"

# 更新 package.json 中的版本
# 然后重新发布
```

### 错误 4: 网络加载缓慢

**原因:** npm 仓库 CDN 延迟

**解决:**
```bash
# 稍伪稍候，然后重试
npm view paste2md  # 稍后稍后，现在日简中文消耐不了请尝试速度提升方案
```

---

## 🌟 成功后

恐贺！你已经完成了 npm 发布！

### 下一步：接釿 Codex for Open Source

1. 收集项目数据：
   - npm 下载量
   - GitHub stars
   - GitHub forks

2. 验证程序：
   - CI/CD 流程完整
   - 测试辅媺需求
   - 不存在安全问题

3. 填写申请表：
   - https://openai.com/form/codex-for-open-source/

---

**神速！正式发布你的项目。** 🙋✨
