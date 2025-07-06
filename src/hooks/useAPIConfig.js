import { useState, useEffect } from 'react';

export const useAPIConfig = () => {
  const [apiConfig, setApiConfig] = useState({
    useMock: false,
    apiEndpoint: '/api/chat/candidates'
  });

  useEffect(() => {
    // Check environment variables and localStorage
    const envUseMock = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
    const localUseMock = typeof window !== 'undefined' 
      ? localStorage.getItem('ats-use-mock-api') === 'true'
      : false;
    
    const shouldUseMock = envUseMock || localUseMock;
    
    setApiConfig({
      useMock: shouldUseMock,
      apiEndpoint: shouldUseMock ? '/api/chat/candidates-mock' : '/api/chat/candidates'
    });
  }, []);

  const toggleMockAPI = () => {
    const newUseMock = !apiConfig.useMock;
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('ats-use-mock-api', newUseMock.toString());
    }
    
    setApiConfig({
      useMock: newUseMock,
      apiEndpoint: newUseMock ? '/api/chat/candidates-mock' : '/api/chat/candidates'
    });
  };

  return { ...apiConfig, toggleMockAPI };
};
