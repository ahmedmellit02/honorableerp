import { supabase } from '@/integrations/supabase/client';

export interface DeviceFingerprint {
  fingerprint: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  colorDepth: number;
  hardwareConcurrency: number;
  webglRenderer: string;
}

// Generate a unique device fingerprint
export const generateDeviceFingerprint = async (): Promise<DeviceFingerprint> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Canvas fingerprinting
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint canvas', 2, 2);
  }
  const canvasFingerprint = canvas.toDataURL();

  // WebGL fingerprinting
  const webglCanvas = document.createElement('canvas');
  const webgl = webglCanvas.getContext('webgl') || webglCanvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
  let webglRenderer = 'unknown';
  
  if (webgl) {
    const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      webglRenderer = webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown';
    }
  }

  // Collect device characteristics
  const deviceData = {
    userAgent: navigator.userAgent,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    colorDepth: screen.colorDepth,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    webglRenderer,
    canvasFingerprint,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
  };

  // Create a hash of all device characteristics
  const fingerprint = await hashDeviceData(JSON.stringify(deviceData));

  return {
    fingerprint,
    userAgent: deviceData.userAgent,
    screenResolution: deviceData.screenResolution,
    timezone: deviceData.timezone,
    language: deviceData.language,
    colorDepth: deviceData.colorDepth,
    hardwareConcurrency: deviceData.hardwareConcurrency,
    webglRenderer: deviceData.webglRenderer,
  };
};

// Hash device data for privacy
const hashDeviceData = async (data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Check if device is banned
export const checkDeviceBanStatus = async (fingerprint: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_device_ban_status', {
      fingerprint
    });
    
    if (error) {
      console.error('Error checking device ban status:', error);
      return false; // Allow access if check fails
    }
    
    return data || false;
  } catch (error) {
    console.error('Error checking device ban status:', error);
    return false; // Allow access if check fails
  }
};

// Log device session
export const logDeviceSession = async (
  fingerprint: string,
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('log_device_session', {
      fingerprint,
      user_id_param: userId,
      ip_addr: ipAddress,
      user_agent_param: userAgent
    });
    
    if (error) {
      console.error('Error logging device session:', error);
    }
  } catch (error) {
    console.error('Error logging device session:', error);
  }
};

// Ban a device (admin function)
export const banDevice = async (
  fingerprint: string,
  reason?: string,
  bannedBy?: string
): Promise<void> => {
  try {
    const { error } = await supabase.rpc('ban_device', {
      fingerprint,
      reason_param: reason,
      banned_by_param: bannedBy
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error banning device:', error);
    throw error;
  }
};

// Get device fingerprint and store in localStorage for persistence
export const getOrCreateDeviceFingerprint = async (): Promise<string> => {
  const stored = localStorage.getItem('device_fingerprint');
  
  if (stored) {
    return stored;
  }
  
  const fingerprint = await generateDeviceFingerprint();
  localStorage.setItem('device_fingerprint', fingerprint.fingerprint);
  
  return fingerprint.fingerprint;
};