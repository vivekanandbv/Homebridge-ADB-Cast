import Bonjour from 'bonjour-service';
import { PersistentClient, createPlatform } from '@foxxmd/chromecast-client';

const bonjour = new Bonjour();

console.log('Searching for Google Cast devices via mDNS...');

const browser = bonjour.find({ type: 'googlecast' });

browser.on('up', async (service) => {
    console.log(`\nDiscovered Device: ${service.name}`);
    console.log(`IP: ${service.addresses?.[0]}`);
    console.log(`Port: ${service.port}`);
    console.log(`TXT Records: ${JSON.stringify(service.txt)}`);

    const ip = service.addresses?.[0];
    if (!ip) {
        console.error('No IP address found for service.');
        return;
    }

    console.log(`\nAttempting to connect to ${ip}:${service.port}...`);

    try {
        const client = new PersistentClient({ host: ip });
        await client.connect();
        
        console.log('✅ Connected successfully!');
        
        const platform = await createPlatform(client);
        
        console.log('\nFetching receiver status...');
        const status = await platform.getStatus();
        console.log('Receiver Status:', JSON.stringify(status, null, 2));

        const volume = await platform.getVolume();
        console.log(`\nCurrent Volume: ${JSON.stringify(volume)}`);

        // Close connection for test
        platform.close();
        
        console.log('\nTest complete for this device.');
        
        // Stop browsing to exit script
        browser.stop();
        bonjour.destroy();
        process.exit(0);

    } catch (error) {
        console.error('❌ Connection or status retrieval failed:', error);
    }
});

browser.start();

// Timeout after 15 seconds
setTimeout(() => {
    console.log('Discovery timeout reached. No devices found or connected within 15 seconds.');
    browser.stop();
    bonjour.destroy();
    process.exit(0);
}, 15000);
