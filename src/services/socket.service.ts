import io, { Socket } from 'socket.io-client';
import { toast } from '@/components/ui/use-toast';
import { Vendor } from '@/types/vendor';
import { Product } from '@/types/product';
import { useAuth } from '@/hooks/use-auth';

interface VendorLocation {
  vendorId: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
  };
}

interface ConsumerLocation {
  consumerId: string;
  location: [number, number];
}

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private locationWatchId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private lastKnownLocation: { lat: number; lng: number; radius?: number } | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isReconnecting = false;
  private vendorUpdateCallbacks: ((vendors: Vendor[]) => void)[] = [];
  private orderStatusCallbacks: ((order: any) => void)[] = [];
  private vendorNearbyCallbacks: ((data: any) => void)[] = [];
  private notificationCallbacks: ((notification: any) => void)[] = [];
  private locationUpdateTimeout: NodeJS.Timeout | null = null;
  private connectionPromise: Promise<Socket | null> | null = null;
  private initialized = false;
  private isAuthenticated = false;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  initialize(): Promise<Socket | null> {
    if (this.initialized && this.socket?.connected && this.isAuthenticated) {
      console.log('Socket already initialized, connected and authenticated');
      return Promise.resolve(this.socket);
    }

    console.log('Initializing socket service...');
    this.initialized = true;
    return this.connect();
  }

  connect(): Promise<Socket | null> {
    // If already connected and authenticated, return the socket
    if (this.socket?.connected && this.isAuthenticated) {
      console.log('Socket already connected and authenticated, reusing connection');
      return Promise.resolve(this.socket);
    }

    // If connection is in progress, return the existing promise
    if (this.connectionPromise) {
      console.log('Connection already in progress, waiting...');
      return this.connectionPromise;
    }

    // Reset reconnection attempts
    this.reconnectAttempts = 0;

    // Create new connection promise
    console.log('Creating new socket connection...');
    this.connectionPromise = new Promise((resolve) => {
      try {
        const auth = useAuth.getState();
        const token = auth.token;
        const userRole = auth.user?.role;

        // Get the base URL by removing '/api' from VITE_API_URL
        const baseURL = import.meta.env.VITE_API_URL.replace('/api', '');
        console.log('Initializing socket connection at:', baseURL);
        
        if (this.socket) {
          console.log('Cleaning up existing socket instance');
          this.cleanup();
        }

        // Configure socket options based on authentication status
        const socketOptions: any = {
          transports: ['websocket'],
          path: '/socket.io',
          autoConnect: false,
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
        };

        // Add authentication if token exists
        if (token) {
          console.log('Connecting with authentication, user role:', userRole);
          socketOptions.auth = { token };
          socketOptions.query = { role: userRole };
        } else {
          console.log('Connecting without authentication (public access)');
        }
        
        // Request notification permission if applicable
        this.requestNotificationPermission();

        this.socket = io(baseURL, socketOptions);

        // Set up connection listeners
        this.socket.on('connect', () => {
          console.log('Socket connected successfully with ID:', this.socket?.id);
          this.isAuthenticated = !!token;
          this.connectionPromise = null;
          this.setupSocketListeners();
          resolve(this.socket);
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          
          // For public access, don't treat connection errors as fatal
          if (!token) {
            console.log('Public access connection error, continuing with limited functionality');
            this.connectionPromise = null;
            resolve(null);
          } else {
            this.handleConnectionError(error);
            resolve(null);
          }
        });

        // Manually connect after setting up listeners
        console.log('Attempting to connect socket...');
        this.socket.connect();

      } catch (error) {
        console.error('Socket connection error:', error);
        this.handleConnectionError(error);
        resolve(null);
      }
    });

    return this.connectionPromise;
  }

  requestNotificationPermission() {
    try {
      if ('Notification' in window) {
        console.log('Checking notification permission status:', Notification.permission);
        
        if (Notification.permission === 'default') {
          console.log('Requesting notification permission from user');
          
          // Request permission to show notifications
          Notification.requestPermission().then(permission => {
            console.log('Notification permission response:', permission);
            
            if (permission === 'granted') {
              console.log('Notification permission granted');
            } else {
              console.log('Notification permission denied');
            }
          });
        }
      } else {
        console.log('Browser does not support notifications');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  private handleConnectionError(error: any) {
    console.error('Connection error:', error);
    this.isAuthenticated = false;
    this.connectionPromise = null;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }
      
      this.reconnectTimer = setTimeout(() => {
        this.connect();
      }, 1000 * this.reconnectAttempts);
    } else {
      console.log('Max reconnection attempts reached, cleaning up');
      this.cleanup();
      toast({
        title: "Connection Error",
        description: "Failed to connect to real-time updates. Please refresh the page.",
        variant: "destructive",
      });
    }
  }

  private cleanup() {
    console.log('Cleaning up socket service...');
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionPromise = null;
    this.stopLocationWatch();
    if (this.locationUpdateTimeout) {
      clearTimeout(this.locationUpdateTimeout);
      this.locationUpdateTimeout = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.lastKnownLocation = null;
    this.vendorUpdateCallbacks = [];
    this.orderStatusCallbacks = [];
    this.vendorNearbyCallbacks = [];
    this.notificationCallbacks = [];
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    this.isAuthenticated = false;
    this.initialized = false;
  }

  private setupSocketListeners() {
    if (!this.socket) {
      console.error('Cannot setup listeners: Socket is null');
      return;
    }
    
    this.socket.removeAllListeners();

    this.socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      this.isAuthenticated = false;
      
      if (reason === 'io server disconnect' || reason === 'io client disconnect') {
        console.log('Disconnection was initiated, not attempting to reconnect');
      } else {
        this.handleConnectionError(reason);
      }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected successfully with ID:', this.socket?.id);
      this.isAuthenticated = true;
      this.reconnectAttempts = 0;
      
      if (this.lastKnownLocation) {
        console.log('Requesting vendors with last known location after reconnect');
        this.requestNearbyVendors(this.lastKnownLocation);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.handleConnectionError(error);
    });

    this.socket.on('locationUpdate', (data) => {
      console.log('Location update received:', data);
    });

    this.socket.on('vendor:location:update', (data) => {
      console.log('Vendor location update:', data);
    });

    this.socket.on('nearby:vendors', (vendors) => {
      this.processVendorsData('nearby:vendors', vendors);
    });

    this.socket.on('nearby:vendors:update', (vendors) => {
      this.processVendorsData('nearby:vendors:update', vendors);
    });

    this.socket.on('get:nearby:vendors:response', (vendors) => {
      this.processVendorsData('get:nearby:vendors:response', vendors);
    });

    this.socket.on('orderStatusUpdate', (data) => {
      console.log('Order status update received:', data);
      this.orderStatusCallbacks.forEach(callback => callback(data));
    });

    this.socket.on('newOrder', (orderData) => {
      console.log('New order notification received:', orderData);
      this.showOrderNotification(orderData);
      this.orderStatusCallbacks.forEach(callback => callback(orderData));
    });

    this.socket.on('pushNotification', (notification) => {
      console.log('Push notification received:', notification);
      this.notificationCallbacks.forEach(callback => callback(notification));
    });

    this.socket.on('vendorNearbyAlert', (data) => {
      console.log('Vendor nearby alert received:', data);
      
      // Trigger native browser notification
      this.showVendorNearbyNotification(data);
      
      // Notify any registered callbacks
      this.vendorNearbyCallbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in vendor nearby callback:', error);
        }
      });
    });
  }

  private processVendorsData(eventName: string, vendors: any) {
    console.log(`Received ${eventName}:`, vendors);
    if (Array.isArray(vendors)) {
      console.log(`Processing ${vendors.length} vendors from ${eventName} event`);
      const processedVendors = vendors.map(vendor => this.processVendorData(vendor));
      this.vendorUpdateCallbacks.forEach(callback => callback(processedVendors));
    } else {
      console.error(`Invalid vendors data format from ${eventName}:`, vendors);
    }
  }

  private processVendorData(vendor: Vendor): Vendor {
    const lastUpdate = vendor.lastUpdate || 0;
    const now = Date.now();
    
    const isOnline = (now - lastUpdate) < 5 * 60 * 1000;
    
    return {
      ...vendor,
      isOnline
    };
  }

  async requestNearbyVendors(location: { lat: number; lng: number; radius?: number }) {
    if (!this.socket?.connected) {
      console.log('Socket not connected, attempting to connect before requesting vendors');
      await this.connect();
    }

    if (!this.socket?.connected) {
      console.error('Failed to connect socket, cannot request nearby vendors');
      return;
    }

    try {
      this.lastKnownLocation = location;
      
      // Calculate timestamp to help with caching on the server
      const timestamp = Date.now();
      
      // GeoJSON format with additional options
      const geoJsonPoint = {
        location: {
          type: 'Point',
          coordinates: [location.lng, location.lat]
        },
        radius: location.radius || 5000,
        timestamp,
        includeDistance: true,
        maxDistance: 10000 // 10km max to find more vendors
      };
      
      // Simple format with precision options
      const simpleFormat = {
        lat: location.lat,
        lng: location.lng,
        radius: location.radius || 5000,
        includeOffline: true, // Include offline vendors to show more options
        timestamp,
        includeDistance: true,
        maxDistance: 10000, // 10km max
        accurateDistance: true // Request accurate distance calculation
      };
      
      console.log('Emitting find:nearby:vendors with data:', geoJsonPoint);
      this.socket.emit('find:nearby:vendors', geoJsonPoint);
      
      console.log('Emitting get:nearby:vendors with data:', simpleFormat);
      this.socket.emit('get:nearby:vendors', simpleFormat);
      
    } catch (error) {
      console.error('Error requesting nearby vendors:', error);
    }
  }

  onNearbyVendorsUpdate(callback: (vendors: Vendor[]) => void) {
    this.vendorUpdateCallbacks.push(callback);
    return () => {
      this.vendorUpdateCallbacks = this.vendorUpdateCallbacks.filter(cb => cb !== callback);
    };
  }

  onOrderStatusUpdate(callback: (order: any) => void) {
    this.orderStatusCallbacks.push(callback);
    return () => {
      this.orderStatusCallbacks = this.orderStatusCallbacks.filter(cb => cb !== callback);
    };
  }

  onVendorNearbyAlert(callback: (data: any) => void) {
    console.log('Registering for vendor nearby alerts');
    this.initialize().then(() => {
      if (this.socket) {
        this.vendorNearbyCallbacks.push(callback);
        console.log('Vendor nearby alert listener registered');
      }
    }).catch(error => {
      console.error('Failed to register for vendor nearby alerts:', error);
    });
    
    return () => {
      this.vendorNearbyCallbacks = this.vendorNearbyCallbacks.filter(cb => cb !== callback);
    };
  }

  onNotification(callback: (notification: any) => void) {
    this.notificationCallbacks.push(callback);
    return () => {
      this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
    };
  }

  disconnect() {
    console.log('Disconnecting socket service...');
    this.cleanup();
    this.initialized = false;
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }

  startVendorLocationBroadcast() {
    if (!this.socket?.connected) {
      this.connect();
    }

    if (this.locationWatchId !== null) {
      return;
    }

    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      toast({
        title: "Location Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
      return;
    }

    this.locationWatchId = navigator.geolocation.watchPosition(
      (position) => {
        if (this.socket?.connected) {
          const locationData = {
            coordinates: [position.coords.longitude, position.coords.latitude]
          };
          
          this.socket.emit('vendor:location:update', locationData);
          this.socket.emit('locationUpdate', locationData);
          
          console.log('Vendor location broadcast sent:', locationData);
        }
      },
      (error) => {
        console.error('Location watch error:', error);
        toast({
          title: "Location Error",
          description: "Failed to update your location. Please check your GPS settings.",
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  async updateConsumerLocation(location: { lat: number; lng: number; radius?: number }) {
    const auth = useAuth.getState();
    if (auth.user?.role !== 'consumer') {
      console.log('User is not a consumer, skipping consumer location update');
      return;
    }

    if (this.locationUpdateTimeout) {
      clearTimeout(this.locationUpdateTimeout);
    }

    // Store last known location to use after reconnections
    this.lastKnownLocation = location;

    this.locationUpdateTimeout = setTimeout(async () => {
      if (!this.socket?.connected) {
        console.log('Socket not connected, attempting to connect before updating location');
        const socket = await this.initialize();
        if (!socket) {
          console.log('Failed to establish socket connection for consumer location update');
          return;
        }
      }

      console.log('Updating consumer location:', location);
      
      // Create both formats for better compatibility
      const data = {
        lat: location.lat,
        lng: location.lng,
        role: 'consumer'
      };

      const locationData = {
        coordinates: [location.lng, location.lat],
        type: 'consumer'
      };

      console.log('Emitting consumer:location:update with data:', data);
      this.socket?.emit('consumer:location:update', data);
      
      console.log('Emitting locationUpdate with data:', locationData);
      this.socket?.emit('locationUpdate', locationData);
      
      // Also request nearby vendors with this location
      this.requestNearbyVendors(location);
      
    }, 500);
  }

  stopLocationWatch() {
    if (this.locationWatchId !== null) {
      navigator.geolocation.clearWatch(this.locationWatchId);
      this.locationWatchId = null;
    }
  }

  onNewOrder(callback: (order: any) => void) {
    console.log('Registering for new order notifications');
    this.initialize().then(() => {
      if (this.socket) {
        this.socket.off('newOrder');
        
        this.socket.on('newOrder', (orderData) => {
          console.log('New order notification received:', orderData);
          
          this.showOrderNotification(orderData);
          
          callback(orderData);
        });
        
        console.log('New order notification listener registered');
      }
    }).catch(error => {
      console.error('Failed to register for order notifications:', error);
    });
    
    return () => {
      if (this.socket) {
        this.socket.off('newOrder');
      }
    };
  }
  
  private showOrderNotification(order: any) {
    try {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          const notification = new Notification('New Order Received!', {
            body: `Order #${order.orderNumber || 'New'} - ₹${order.totalAmount || 0} from ${order.customerName || 'Customer'}`,
            icon: '/notification-icon.png'
          });
          
          setTimeout(() => notification.close(), 5000);
          
          notification.onclick = () => {
            window.focus();
          };
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  private showVendorNearbyNotification(data: any) {
    try {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          const vendorName = data.vendorName || 'A vendor';
          const distance = data.distance ? `${Math.round(data.distance)} meters` : 'nearby';
          
          const notification = new Notification('Vendor Nearby!', {
            body: `${vendorName} is ${distance} from your location. Check what's available!`,
            icon: '/vendor-notification-icon.png'
          });
          
          setTimeout(() => notification.close(), 5000);
          
          notification.onclick = () => {
            window.focus();
          };
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission();
        }
      }
    } catch (error) {
      console.error('Error showing vendor nearby notification:', error);
    }
  }

  emitOrderEvent(event: string, data: any) {
    if (!this.socket?.connected) {
      this.connect();
    }
    this.socket?.emit(event, data);
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  emit(event: string, data: any) {
    try {
      if (!this.socket) {
        console.warn('Socket.io instance not available for emit. Event not sent:', event);
        return;
      }
      
      if (!this.socket.connected) {
        console.warn('Socket.io not connected. Attempting to reconnect before emitting:', event);
        this.connect()
          .then(socket => {
            if (socket) {
              console.log(`Socket reconnected, emitting delayed event: ${event}`);
              socket.emit(event, data);
            }
          })
          .catch(error => {
            console.error('Failed to reconnect socket before emitting:', error);
          });
        return;
      }
      
      console.log(`Emitting socket event: ${event}`, data);
      this.socket.emit(event, data);
    } catch (error) {
      console.error(`Error emitting socket event ${event}:`, error);
    }
  }
}

export const socketService = SocketService.getInstance();