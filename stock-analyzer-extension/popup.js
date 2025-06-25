// 설정 로드
chrome.storage.local.get(['serverUrl', 'openaiApiKey'], (result) => {
  if (result.serverUrl) {
    document.getElementById('serverUrl').value = result.serverUrl;
  } else {
    document.getElementById('serverUrl').value = 'http://localhost:3000';
  }
  
  if (result.openaiApiKey) {
    document.getElementById('apiKey').value = result.openaiApiKey;
  }
  
  checkServerStatus();
});

// 서버 상태 확인
async function checkServerStatus() {
  const serverUrl = document.getElementById('serverUrl').value;
  const statusEl = document.getElementById('serverStatus');
  
  try {
    const response = await fetch(`${serverUrl}/health`);
    if (response.ok) {
      statusEl.textContent = '서버 연결됨 ✅';
      statusEl.className = 'server-status online';
    } else {
      throw new Error('Server not responding');
    }
  } catch (error) {
    statusEl.textContent = '서버 연결 실패 ❌';
    statusEl.className = 'server-status offline';
  }
}

// 저장 버튼 클릭
document.getElementById('saveBtn').addEventListener('click', () => {
  const serverUrl = document.getElementById('serverUrl').value;
  const apiKey = document.getElementById('apiKey').value;
  
  chrome.storage.local.set({ 
    serverUrl: serverUrl,
    openaiApiKey: apiKey 
  }, () => {
    // Background script에 알림
    chrome.runtime.sendMessage({ 
      action: 'updateServerUrl', 
      serverUrl: serverUrl 
    });
    
    chrome.runtime.sendMessage({ 
      action: 'updateApiKey', 
      apiKey: apiKey 
    });
    
    alert('설정이 저장되었습니다.');
    checkServerStatus();
  });
});