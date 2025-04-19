const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Proxy all API requests to the backend
  const proxyConfig = {
    target: 'http://localhost:5001',
    changeOrigin: true,
    logLevel: 'debug',
    onProxyReq: (proxyReq, req, res) => {
      console.log(`Proxying request to: ${req.method} ${proxyReq.path}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log(`Received response from: ${req.method} ${req.path} with status ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err);
    }
  };
  
  // Proxy paths
  app.use('/api', createProxyMiddleware(proxyConfig));
  app.use('/chat', createProxyMiddleware(proxyConfig));
  app.use('/feedback', createProxyMiddleware(proxyConfig));
  app.use('/votes', createProxyMiddleware({...proxyConfig, pathRewrite: {'^/votes': '/votes'}}));
  app.use('/votes/statistics', createProxyMiddleware({...proxyConfig, pathRewrite: {'^/votes/statistics': '/votes/statistics'}}));
  app.use('/health', createProxyMiddleware(proxyConfig));
};
