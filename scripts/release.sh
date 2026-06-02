#!/bin/bash

# paste2md 完整发布脚本
# 自动完成 npm 发布和 GitHub 配置

set -e

echo "==============================================="
echo "paste2md 项目完整发布流程"
echo "==============================================="
echo ""

# 颜色输出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 步骤1：检查 npm 登录状态
echo -e "${BLUE}[1/8]${NC} 检查 npm 登录状态..."
if npm whoami > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 已登录到 npm${NC}"
else
    echo -e "${YELLOW}⚠ 未登录到 npm，请登录${NC}"
    echo "执行: npm login"
    npm login
fi
echo ""

# 步骤2：验证项目结构
echo -e "${BLUE}[2/8]${NC} 验证项目结构..."
if [ ! -f "package.json" ]; then
    echo -e "${YELLOW}✗ package.json 不存在${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 项目结构完整${NC}"
echo ""

# 步骤3：运行测试
echo -e "${BLUE}[3/8]${NC} 运行测试..."
npm test
echo -e "${GREEN}✓ 所有测试通过${NC}"
echo ""

# 步骤4：检查代码风格
echo -e "${BLUE}[4/8]${NC} 检查代码风格..."
npm run lint
echo -e "${GREEN}✓ 代码风格检查通过${NC}"
echo ""

# 步骤5：生成覆盖率报告
echo -e "${BLUE}[5/8]${NC} 生成测试覆盖率报告..."
npm run test:coverage
echo -e "${GREEN}✓ 覆盖率报告已生成${NC}"
echo ""

# 步骤6：创建 Git 标签
echo -e "${BLUE}[6/8]${NC} 创建 Git 标签..."
VERSION=$(node -p "require('./package.json').version")
echo "版本: $VERSION"

if git rev-parse "v$VERSION" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ 标签 v$VERSION 已存在${NC}"
else
    git tag "v$VERSION" -m "Release version $VERSION"
    echo -e "${GREEN}✓ 创建标签 v$VERSION${NC}"
fi
echo ""

# 步骤7：推送标签和代码
echo -e "${BLUE}[7/8]${NC} 推送到 GitHub..."
git push origin main
git push origin "v$VERSION"
echo -e "${GREEN}✓ 已推送到 GitHub${NC}"
echo ""

# 步骤8：发布到 npm
echo -e "${BLUE}[8/8]${NC} 发布到 npm..."
npm publish
echo -e "${GREEN}✓ 已发布到 npm${NC}"
echo ""

echo "==============================================="
echo -e "${GREEN}✓ 发布完成！${NC}"
echo "==============================================="
echo ""
echo "后续步骤："
echo "1. 访问 GitHub: https://github.com/lananh93159-boop/paste2md/releases"
echo "2. 创建 Release 描述"
echo "3. 验证 npm 发布: npm info paste2md"
echo "4. GitHub Pages 会自动部署"
echo ""
