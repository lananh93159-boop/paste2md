#!/bin/bash

# paste2md 完整初始化脚本
# 适用于首次设置项目

set -e

echo "==============================================="
echo "paste2md 项目完整初始化"
echo "==============================================="
echo ""

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Step 1: 安装依赖${NC}"
npm install
echo -e "${GREEN}✓ 依赖安装完成${NC}"
echo ""

echo -e "${BLUE}Step 2: 生成 GitHub 配置${NC}"
bash scripts/setup-github.sh
echo ""

echo -e "${BLUE}Step 3: 创建许可证${NC}"
if [ ! -f "LICENSE" ]; then
    cat > LICENSE << 'LICENSE_EOF'
MIT License

Copyright (c) 2026 lananh93159-boop

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
LICENSE_EOF
    echo -e "${GREEN}✓ LICENSE 已创建${NC}"
else
    echo -e "${YELLOW}⚠ LICENSE 已存在${NC}"
fi
echo ""

echo -e "${BLUE}Step 4: 运行测试${NC}
npm test
echo -e "${GREEN}✓ 测试通过${NC}"
echo ""

echo -e "${BLUE}Step 5: 提交初始化${NC}"
git add .
git commit -m "chore: Initial project setup with GitHub Actions and documentation" || true
echo -e "${GREEN}✓ 已提交更改${NC}"
echo ""

echo "==============================================="
echo -e "${GREEN}✓ 项目初始化完成！${NC}"
echo "==============================================="
echo ""
echo "后续步骤："
echo "1. 推送到 GitHub: git push origin main"
echo "2. 在 GitHub 设置 NPM_TOKEN secret"
echo "3. npm 登录: npm login"
echo "4. 发布到 npm: bash scripts/release.sh"
echo ""
