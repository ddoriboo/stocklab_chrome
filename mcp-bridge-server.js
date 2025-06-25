const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json());

// MCP 서버 프로세스
let mcpProcess;

// MCP 서버 시작
function startMCPServer() {
  mcpProcess = spawn('uvx', ['kospi-kosdaq-stock-server'], {
    env: { ...process.env }
  });
  
  mcpProcess.stdout.on('data', (data) => {
    console.log(`MCP Server: ${data}`);
  });
  
  mcpProcess.stderr.on('data', (data) => {
    console.error(`MCP Server Error: ${data}`);
  });
  
  mcpProcess.on('close', (code) => {
    console.log(`MCP Server exited with code ${code}`);
  });
}

// MCP 서버와 통신하는 함수
async function callMCPTool(toolName, params) {
  // MCP 프로토콜에 따라 JSON-RPC 형식으로 요청
  const request = {
    jsonrpc: '2.0',
    method: `tools/${toolName}`,
    params: params,
    id: Date.now()
  };
  
  // 실제 구현에서는 MCP 서버와 stdio를 통해 통신
  // 여기서는 예시로 직접 함수 호출
  return new Promise((resolve) => {
    // 시뮬레이션된 응답
    setTimeout(() => {
      resolve({
        result: {
          data: `Mock data for ${toolName}`
        }
      });
    }, 100);
  });
}

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ status: 'ok', mcpServer: !!mcpProcess });
});

// API 엔드포인트
app.post('/api/stock/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    const today = new Date().toISOString().split('T')[0];
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString().split('T')[0];
    
    // MCP 서버 호출
    const [ohlcv, marketCap, fundamental] = await Promise.all([
      callMCPTool('get_stock_ohlcv', {
        ticker,
        start_date: oneMonthAgo,
        end_date: today
      }),
      callMCPTool('get_stock_market_cap', {
        ticker,
        start_date: today,
        end_date: today
      }),
      callMCPTool('get_stock_fundamental', {
        ticker,
        start_date: today,
        end_date: today
      })
    ]);
    
    res.json({
      ohlcv: ohlcv.result,
      marketCap: marketCap.result,
      fundamental: fundamental.result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Bridge server running on port ${PORT}`);
  startMCPServer();
});

// 종료 처리
process.on('SIGINT', () => {
  if (mcpProcess) {
    mcpProcess.kill();
  }
  process.exit();
});