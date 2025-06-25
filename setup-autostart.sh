#!/bin/bash

# 자동 실행 설정 스크립트

echo "주식 분석 서버 자동 실행 설정..."

# 1. Launch Agent plist 파일 생성
cat > ~/Library/LaunchAgents/com.stockanalyzer.servers.plist << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.stockanalyzer.servers</string>
    
    <key>ProgramArguments</key>
    <array>
        <string>/bin/bash</string>
        <string>$HOME/Desktop/security/start-servers.sh</string>
    </array>
    
    <key>RunAtLoad</key>
    <true/>
    
    <key>KeepAlive</key>
    <true/>
    
    <key>StandardOutPath</key>
    <string>$HOME/Desktop/security/logs/servers.log</string>
    
    <key>StandardErrorPath</key>
    <string>$HOME/Desktop/security/logs/servers.error.log</string>
</dict>
</plist>
EOF

# 2. 서버 시작 스크립트 생성
cat > ~/Desktop/security/start-servers.sh << 'EOF'
#!/bin/bash

# 로그 디렉토리 생성
mkdir -p ~/Desktop/security/logs

# MCP 서버 시작
echo "Starting MCP Server..." >> ~/Desktop/security/logs/servers.log
uvx kospi-kosdaq-stock-server &
MCP_PID=$!

# 브릿지 서버 시작
cd ~/Desktop/security
echo "Starting Bridge Server..." >> ~/Desktop/security/logs/servers.log
npm start &
BRIDGE_PID=$!

# PID 저장
echo $MCP_PID > ~/Desktop/security/logs/mcp.pid
echo $BRIDGE_PID > ~/Desktop/security/logs/bridge.pid

# 프로세스 대기
wait
EOF

# 3. 실행 권한 부여
chmod +x ~/Desktop/security/start-servers.sh

# 4. 종료 스크립트 생성
cat > ~/Desktop/security/stop-servers.sh << 'EOF'
#!/bin/bash

# PID 파일에서 프로세스 ID 읽기
if [ -f ~/Desktop/security/logs/mcp.pid ]; then
    kill $(cat ~/Desktop/security/logs/mcp.pid) 2>/dev/null
    rm ~/Desktop/security/logs/mcp.pid
fi

if [ -f ~/Desktop/security/logs/bridge.pid ]; then
    kill $(cat ~/Desktop/security/logs/bridge.pid) 2>/dev/null
    rm ~/Desktop/security/logs/bridge.pid
fi

echo "Servers stopped"
EOF

chmod +x ~/Desktop/security/stop-servers.sh

# 5. Launch Agent 로드
launchctl load ~/Library/LaunchAgents/com.stockanalyzer.servers.plist

echo "자동 실행 설정 완료!"
echo "시스템 재시작시 서버가 자동으로 실행됩니다."
echo ""
echo "수동 제어 명령어:"
echo "  시작: launchctl start com.stockanalyzer.servers"
echo "  중지: launchctl stop com.stockanalyzer.servers"
echo "  제거: launchctl unload ~/Library/LaunchAgents/com.stockanalyzer.servers.plist"