#!/bin/bash

# paste2md GitHub 配置脚本
# 本地设置所有必需的文件

set -e

echo "==============================================="
echo "paste2md GitHub 配置"
echo "==============================================="
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# 创建目录
echo -e "${BLUE}创建目录结构...${NC}"
mkdir -p .github/workflows
mkdir -p .github/ISSUE_TEMPLATE
mkdir -p docs
echo -e "${GREEN}✓ 目录创建完成${NC}"
echo ""

# 检查文件是否已存在
echo -e "${BLUE}生成 GitHub Actions 工作流...${NC}"

if [ -f ".github/workflows/test.yml" ]; then
    echo "test.yml 已存在，跳过"
else
    cat > .github/workflows/test.yml << 'WORKFLOW_EOF'
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
        node-version: [14.x, 16.x, 18.x, 20.x]

    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    - name: Install dependencies
      run: npm ci
    - name: Run linter
      run: npm run lint
    - name: Run tests
      run: npm test
    - name: Generate coverage
      run: npm run test:coverage
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
WORKFLOW_EOF
    echo "test.yml 已创建"
fi

if [ -f ".github/workflows/publish.yml" ]; then
    echo "publish.yml 已存在，跳过"
else
    cat > .github/workflows/publish.yml << 'PUBLISH_EOF'
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18.x'
        registry-url: 'https://registry.npmjs.org'
    - name: Install dependencies
      run: npm ci
    - name: Run tests
      run: npm test
    - name: Publish to npm
      run: npm publish
      env:
        NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
PUBLISH_EOF
    echo "publish.yml 已创建"
fi

echo -e "${GREEN}✓ GitHub Actions 工作流配置完成${NC}"
echo ""

echo -e "${BLUE}生成其他配置文件...${NC}"

# .npmrc
if [ -f ".npmrc" ]; then
    echo ".npmrc 已存在，跳过"
else
    cat > .npmrc << 'NPMRC_EOF'
registry=https://registry.npmjs.org/
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
NPMRC_EOF
    echo ".npmrc 已创建"
fi

echo -e "${GREEN}✓ 配置文件生成完成${NC}"
echo ""

echo "==============================================="
echo -e "${GREEN}✓ GitHub 配置完成！${NC}"
echo "==============================================="
echo ""
echo "下一步："
echo "1. 提交更改: git add . && git commit -m 'ci: Add GitHub Actions and configs'"
echo "2. 推送到 GitHub: git push origin main"
echo "3. 在 GitHub 设置 NPM_TOKEN secret"
echo "4. 运行发布脚本: bash scripts/release.sh"
echo ""
