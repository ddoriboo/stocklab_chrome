document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  try {
    const response = await chrome.runtime.sendMessage({ action: 'getApiKey' });
    if (response.success && response.apiKey) {
      apiKeyInput.value = response.apiKey;
      showStatus('API 키가 설정되어 있습니다.', 'success');
    }
  } catch (error) {
    console.error('API 키 불러오기 실패:', error);
  }

  saveBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
      showStatus('API 키를 입력해주세요.', 'error');
      return;
    }
    
    if (!apiKey.startsWith('sk-')) {
      showStatus('올바른 OpenAI API 키 형식이 아닙니다.', 'error');
      return;
    }
    
    saveBtn.disabled = true;
    saveBtn.textContent = '저장 중...';
    
    try {
      const response = await chrome.runtime.sendMessage({ 
        action: 'setApiKey', 
        apiKey: apiKey 
      });
      
      if (response.success) {
        showStatus('API 키가 성공적으로 저장되었습니다!', 'success');
        setTimeout(() => {
          window.close();
        }, 1500);
      } else {
        showStatus('API 키 저장에 실패했습니다.', 'error');
      }
    } catch (error) {
      console.error('API 키 저장 실패:', error);
      showStatus('API 키 저장 중 오류가 발생했습니다.', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = '저장';
    }
  });
  
  apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      saveBtn.click();
    }
  });
});

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';
  
  setTimeout(() => {
    status.style.display = 'none';
  }, 3000);
}