const allowedIPs = [
  '127.0.0.1',        // localhost
  '::1',              // localhost IPv6
  '192.168.1.0/24',   // Local network range
  '10.0.0.0/8',       // Private network range
  '172.16.0.0/12',    // Private network range
  '0.0.0.0/0'         // Allow all IPs (unrestricted access)
];

// Function to check if IP is in CIDR range
const isIPInRange = (ip, cidr) => {
  if (!cidr.includes('/')) {
    return ip === cidr;
  }
  
  const [range, bits] = cidr.split('/');
  const mask = ~(2 ** (32 - bits) - 1);
  
  const ipToNumber = (ip) => {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0);
  };
  
  return (ipToNumber(ip) & mask) === (ipToNumber(range) & mask);
};

// Get real IP address from request
const getRealIP = (req) => {
  return req.headers['x-forwarded-for'] ||
         req.headers['x-real-ip'] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.ip;
};

// IP-based admin authorization middleware (grants full admin access)
const restrictAdminIP = (req, res, next) => {
  try {
    const clientIP = getRealIP(req);
    
    // Clean IPv6 mapped IPv4 addresses
    const cleanIP = clientIP.replace(/^::ffff:/, '');
    
    // Log access attempt
    console.log(`[ACCESS] Admin access from IP: ${cleanIP}`);
    console.log(`[ACCESS] User-Agent: ${req.headers['user-agent']}`);
    console.log(`[ACCESS] Timestamp: ${new Date().toISOString()}`);
    
    // Check if IP is allowed
    const isAllowed = allowedIPs.some(allowedIP => isIPInRange(cleanIP, allowedIP));
    
    if (!isAllowed) {
      console.warn(`[ACCESS] BLOCKED: Unauthorized admin access attempt from IP: ${cleanIP}`);
      
      return res.status(403).json({
        success: false,
        message: 'Access denied. Your IP address is not authorized for admin access.',
        code: 'IP_RESTRICTED',
        timestamp: new Date().toISOString()
      });
    }
    
    // Grant full admin access - set admin user in request
    req.user = {
      _id: 'ip-admin',
      username: 'ip-admin',
      email: 'admin@system.local',
      role: 'super-admin',
      permissions: ['all'],
      isIPAuthorized: true
    };
    
    console.log(`[ACCESS] GRANTED: Full admin access for IP: ${cleanIP}`);
    next();
    
  } catch (error) {
    console.error('[ACCESS] Error in IP authorization middleware:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal authorization error.',
      code: 'AUTH_ERROR'
    });
  }
};

// Development mode with full admin access
const restrictAdminIPDev = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[ACCESS] Development mode: Granting full admin access');
    
    // Grant full admin access in development
    req.user = {
      _id: 'dev-admin',
      username: 'dev-admin',
      email: 'dev@system.local',
      role: 'super-admin',
      permissions: ['all'],
      isIPAuthorized: true,
      isDevelopment: true
    };
    
    return next();
  }
  
  return restrictAdminIP(req, res, next);
};

// Function to add IP to allowed list (for dynamic management)
const addAllowedIP = (ip) => {
  if (!allowedIPs.includes(ip)) {
    allowedIPs.push(ip);
    console.log(`[SECURITY] Added IP to allowed list: ${ip}`);
  }
};

// Function to remove IP from allowed list
const removeAllowedIP = (ip) => {
  const index = allowedIPs.indexOf(ip);
  if (index > -1) {
    allowedIPs.splice(index, 1);
    console.log(`[SECURITY] Removed IP from allowed list: ${ip}`);
  }
};

// Function to get current allowed IPs
const getAllowedIPs = () => {
  return [...allowedIPs];
};

module.exports = {
  restrictAdminIP,
  restrictAdminIPDev,
  addAllowedIP,
  removeAllowedIP,
  getAllowedIPs,
  getRealIP
};