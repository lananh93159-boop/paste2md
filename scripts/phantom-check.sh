#!/bin/bash

# paste2md 幻灵检查脚本
# 检查是否所有东西都存在

set -e

echo "==============================================="
echo "paste2md 幻灵检查"
echo "==============================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0

echo -e "${BLUE}检查项目结构...${NC}"
echo ""

# 检查核心文件
echo -e "${BLUE}核心文件:${NC}"
for file in package.json README.md LICENSE .npmrc bin/paste2md.js src/index.js src/cleaner.js src/utils.js; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file 丢失${NC}"
        ERRORS=$((ERRORS+1))
    fi
done
echo ""

# 检查文档
echo -e "${BLUE}文档文件:${NC}"
for file in README.md CONTRIBUTING.md CHANGELOG.md SECURITY.md ARCHITECTURE.md FAQ.md; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${YELLOW}⚠ $file 丢失 (推荐)${NC}"
    fi
done
echo ""

# 检查脚本
echo -e "${BLUE}脚本文件:${NC}"
for file in scripts/init.sh scripts/setup-github.sh scripts/release.sh scripts/pre-publish-check.sh; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${YELLOW}⚠ $file 丢失${NC}"
    fi
done
echo ""

# 检查配置文件
echo -e "${BLUE}配置文件:${NC}"
for file in .eslintrc.json jest.config.js .gitignore .npmignore; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file 丢失${NC}"
        ERRORS=$((ERRORS+1))
    fi
done
echo ""

# 检查 GitHub 配置
echo -e "${BLUE}GitHub 配置:${NC}"
for file in .github/workflows/test.yml .github/workflows/publish.yml .github/workflows/codeql.yml .github/ISSUE_TEMPLATE/bug_report.md .github/ISSUE_TEMPLATE/feature_request.md; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file 丢失${NC}"
        ERRORS=$((ERRORS+1))
    fi
done
echo ""

# 检查测试文件
echo -e "${BLUE}测试文件:${NC}"
if [ -d "test" ] && [ -f "test/index.test.js" ]; then
    TEST_COUNT=$(grep -c "test('" test/index.test.js || true)
    echo -e "${GREEN}✓ test/index.test.js ($TEST_COUNT 个测试)${NC}"
else
    echo -e "${RED}✗ test/index.test.js 丢失${NC}"
    ERRORS=$((ERRORS+1))
fi
echo ""

# 检查 node_modules
echo -e "${BLUE}依赖检查:${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓ node_modules 存在${NC}"
else
    echo -e "${YELLOW}⚠ node_modules 不存在 (需要运行 npm install)${NC}"
fi
echo ""

# 检查 .git
echo -e "${BLUE}Git 检查:${NC}"
if [ -d ".git" ]; then
    COMMITS=$(git log --oneline | wc -l)
    echo -e "${GREEN}✓ Git 仓库 ($COMMITS 个提交)${NC}"
else
    echo -e "${RED}✗ Git 仓库不存在${NC}"
    ERRORS=$((ERRORS+1))
fi
echo ""

# 水水地检查
echo -e "${BLUE}幻灵检查结果:${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ 所有文件都存在！可以发布了！${NC}"
else
    echo -e "${RED}❌ 东西许多，请修复 $ERRORS 个错误${NC}"
    exit 1
fi

echo ""
echo "==============================================="
echo ""
echo "下一步："
echo "1. 运行: npm test"
echo "2. 运行: npm publish"
echo "3. 验证: npm view paste2md"
echo ""
