import Bonjour, { Service } from 'bonjour-service';
import { EventEmitter } from 'events';

export interface DiscoveredDevice {
  id: string;
  name: string;
  model: string;
  ip: string;
  port: number;
  txt: any;
}

export class DiscoveryEngine extends EventEmitter {
  private bonjour: Bonjour;
  private browser: any;
  private devices: Map<string, DiscoveredDevice> = new Map();

  constructor() {
    super();
    this.bonjour = new Bonjour();
  }

  start() {
    this.browser = this.bonjour.find({ type: 'googlecast' });
    this.browser.on('up', this.onServiceUp.bind(this));
    this.browser.start();
  }

  stop() {
    if (this.browser) {
      this.browser.stop();
    }
    this.bonjour.destroy();
  }

  private onServiceUp(service: Service) {
    const txt = service.txt as any;
    if (!txt || !txt.id) return;
    
    const ip = service.addresses?.[0];
    if (!ip) return;

    const model = txt.md || 'Unknown';
    const name = txt.fn || service.name;

    // Filter out Tata Play set-top boxes as requested by user
    if (model.toLowerCase().includes('tata sky') || name.toLowerCase().includes('tata play')) {
      console.log(`[DiscoveryEngine] Ignoring non-Chromecast device: ${name} (${model})`);
      return;
    }

    const device: DiscoveredDevice = {
      id: txt.id,
      name: name,
      model: model,
      ip: ip,
      port: service.port,
      txt: txt
    };

    this.devices.set(device.id, device);
    this.emit('device_discovered', device);
  }
}
