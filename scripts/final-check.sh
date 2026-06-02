#!/bin/bash

# 国民点检检查脚本
# 检查 npm 发布前的最后一步

set -e

echo "==============================================="
echo "npm 发布前最后检查"
echo "==============================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}1. 检查 npm 登录...${NC}"
if npm whoami > /dev/null 2>&1; then
    USER=$(npm whoami)
    echo -e "${GREEN}✓ 已以 $USER 身份登录${NC}"
else
    echo -e "${RED}✗ 未登录 npm${NC}"
    echo "执行: npm login"
    exit 1
fi
echo ""

echo -e "${BLUE}2. 检查版本号...${NC}"
VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}✓ 版本: $VERSION${NC}"
echo ""

echo -e "${BLUE}3. 运行测试...${NC}"
if npm test > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 所有测试通过${NC}"
else
    echo -e "${RED}✗ 测试失败${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}4. 检查代码风格...${NC}"
if npm run lint > /dev/null 2>&1; then
    echo -e "${GREEN}✓ 代码风格正常${NC}"
else
    echo -e "${RED}✗ 代码风格检查失败${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}5. 检查 package.json 完整性...${NC}"
NAME=$(node -p "require('./package.json').name")
DESC=$(node -p "require('./package.json').description")
echo -e "${GREEN}✓ 名称: $NAME${NC}"
echo -e "${GREEN}✓ 描述: $DESC${NC}"
echo ""

echo "==============================================="
echo -e "${GREEN}✅ 浅局检查完成！【准许发布】${NC}"
echo "==============================================="
echo ""
echo "下一步：执行 npm publish"
echo ""
