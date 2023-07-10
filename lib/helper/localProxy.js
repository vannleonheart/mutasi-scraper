
async function startServer(port = 1080) {
    const module = await import("simple-socks");
    const socks5 = module.default;
    const server = socks5.createServer().listen(port);

  // When a request arrives for a remote destination
  server.on('proxyConnect', (info, destination) => {
    console.log('[PROXY] connected to remote server at %s:%d', info.address, info.port);
  });




  // When a proxy connection ends
  server.on('proxyEnd', (response, args) => {
    console.log('socket closed with code %d', response);
    console.log(args);
  });

  return server;
}

module.exports = startServer;
