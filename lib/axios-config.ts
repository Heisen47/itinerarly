import axios from 'axios';

axios.defaults.withCredentials = true;

axios.interceptors.request.use(
  (config) => {
    const cookieHeader = config.headers['Cookie'] || '';

    const authorizationHeader = config.headers['Authorization'];
    const xAuthTokenHeader = config.headers['X-Auth-Token'];
    
    return config;
  },
  (error) => {
    console.error('Axios Request Error:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    const setCookieHeader = response.headers['set-cookie'] || [];
    const authorizationHeader = response.headers['authorization'];
    const xAuthTokenHeader = response.headers['x-auth-token'];
    
    const isRedirect = response.status >= 300 && response.status < 400;
    const redirectUrl = response.headers['location'];
    
    return response;
  },
  (error) => {
    const headers = error.response?.headers || {};
    const setCookieHeader = headers['set-cookie'] || [];
    
    console.error('Axios Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      cookies: {
        hasSetCookie: setCookieHeader.length > 0,
        hasJSESSIONID: Array.isArray(setCookieHeader) ? 
          setCookieHeader.some(cookie => cookie?.includes('JSESSIONID')) : 
          String(setCookieHeader).includes('JSESSIONID'),
        hasAuthToken: Array.isArray(setCookieHeader) ? 
          setCookieHeader.some(cookie => cookie?.includes('auth-token')) : 
          String(setCookieHeader).includes('auth-token'),
        hasAltAuthToken: Array.isArray(setCookieHeader) ? 
          setCookieHeader.some(cookie => cookie?.includes('authToken')) : 
          String(setCookieHeader).includes('authToken')
      },
      headers: {
        'Authorization': headers['authorization'] ? 'Present' : 'Not present',
        'X-Auth-Token': headers['x-auth-token'] ? 'Present' : 'Not present'
      },
      redirect: headers['location'] ? { to: headers['location'] } : 'No redirect'
    });
    return Promise.reject(error);
  }
);

export default axios;
