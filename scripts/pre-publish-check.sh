#!/bin/bash

# paste2md npm 发布前检查
# 验证所有必需的文件和配置

set -e

echo "==============================================="
echo "paste2md npm 发布前检查"
echo "==============================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0

echo -e "${BLUE}检查项目配置...${NC}"
echo ""

# 检查 package.json
if [ ! -f "package.json" ]; then
    echo -e "${RED}✗ package.json 不存在${NC}"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✓ package.json 存在${NC}"
fi

# 检查 README.md
if [ ! -f "README.md" ]; then
    echo -e "${RED}✗ README.md 不存在${NC}"
    ERRORS=$((ERRORS+1))
else
    echo -e "${GREEN}✓ README.md 存在${NC}"
fi

# 检查 LICENSE
if [ ! -f "LICENSE" ]; then
    echo -e "${YELLOW}⚠ LICENSE 文件不存在（推荐添加）${NC}"
else
    echo -e "${GREEN}✓ LICENSE 存在${NC}"
fi

# 检查 .npmignore
if [ ! -f ".npmignore" ]; then
    echo -e "${YELLOW}⚠ .npmignore 不存在（推荐添加）${NC}"
else
    echo -e "${GREEN}✓ .npmignore 存在${NC}"
fi

echo ""
echo -e "${BLUE}检查依赖...${NC}"

# 检查 node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠ node_modules 不存在，运行 npm install${NC}"
    npm install
else
    echo -e "${GREEN}✓ 依赖已安装${NC}"
fi

echo ""
echo -e "${BLUE}运行测试...${NC}"

if npm test; then
    echo -e "${GREEN}✓ 所有测试通过${NC}"
else
    echo -e "${RED}✗ 测试失败${NC}"
    ERRORS=$((ERRORS+1))
fi

echo ""
echo -e "${BLUE}检查代码风格...${NC}"

if npm run lint; then
    echo -e "${GREEN}✓ 代码风格检查通过${NC}"
else
    echo -e "${RED}✗ 代码风格检查失败${NC}"
    ERRORS=$((ERRORS+1))
fi

echo ""
echo -e "${BLUE}检查 npm 登录...${NC}"

if npm whoami > /dev/null 2>&1; then
    USER=$(npm whoami)
    echo -e "${GREEN}✓ 已登录 npm (用户: $USER)${NC}"
else
    echo -e "${RED}✗ 未登录 npm${NC}"
    ERRORS=$((ERRORS+1))
fi

echo ""
echo "==============================================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ 所有检查通过，可以发布！${NC}"
    echo "运行: npm publish"
else
    echo -e "${RED}✗ 有 $ERRORS 个错误需要修复${NC}"
    exit 1
fi

echo "==============================================="
echo ""
