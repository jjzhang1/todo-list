#!/bin/bash
# Todo Flow 服务器部署脚本
# 在服务器上运行: bash deploy.sh

set -e

echo "=== 1. 安装依赖 ==="
# 安装 Node.js 和 npm（如果未安装）
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 安装 PM2（如果未安装）
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2 yarn
fi

echo "=== 2. 拉取代码 ==="
if [ -d "todo-app" ]; then
    cd todo-app
    git pull origin main
else
    git clone https://github.com/jjzhang1/todo-list.git todo-app
    cd todo-app
fi

echo "=== 3. 安装项目依赖 ==="
yarn install

echo "=== 4. 构建项目 ==="
yarn build

echo "=== 5. 使用 PM2 启动（端口 8524）==="
pm2 delete todo-app 2>/dev/null || true
pm2 start yarn --name todo-app -- start -p 8524
pm2 save
pm2 startup

echo "=== 部署完成！==="
echo "应用已启动在 http://localhost:8524"
echo ""
echo "常用命令:"
echo "  pm2 status            - 查看进程状态"
echo "  pm2 logs todo-app     - 查看日志"
echo "  pm2 restart todo-app  - 重启应用"
echo "  pm2 stop todo-app     - 停止应用"
