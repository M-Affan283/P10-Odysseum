/*

Filename: serverHealthUtils.js

This file contains utility functions to check the health of the server.

Author: Affan

*/

import os from 'os';
import pidusage from 'pidusage';

const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

const formatBytes = (bytes) => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const size = Math.abs(bytes);
    const index = size ? Math.floor(Math.log(size) / Math.log(1024)) : 0;
    const formattedSize = (size / Math.pow(1024, index)).toFixed(2) + ' ' + units[index];
    return bytes < 0 ? `-${formattedSize}` : formattedSize;
}

const formatCpuUsage = (cpuUsage) => {
    return {
        user: (cpuUsage.user / 1000).toFixed(2) + ' ms', // Convert microseconds to milliseconds
        system: (cpuUsage.system / 1000).toFixed(2) + ' ms',
        total: ((cpuUsage.user + cpuUsage.system) / 1000).toFixed(2) + ' ms'
    };
}


/**
 * Function to check the health of the server
 * @param {Date} SERVER_START_TIME - Start time of the server
 * @returns {Object} - Object containing server health information
 */

export const checkServerHealth = async (SERVER_START_TIME) => {
    const currentTime = new Date();
    const uptime = currentTime - SERVER_START_TIME; // uptime in milliseconds
    const formattedUptime = formatTime(uptime);
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Get CPU load average
    const loadAverage = os.loadavg(); // returns an array of [1min, 5min, 15min]
    
    // Get detailed process CPU usage
    const pidUsage = await pidusage(process.pid);

    console.log("\n\nHealth Check Request for Odysseum Server.");
    console.log("Current Time: ", currentTime.toLocaleString());
    console.log("Server Uptime: ", formattedUptime);
    console.log("Memory Usage: ");
    console.log("RSS: ", formatBytes(memoryUsage.rss));
    console.log("Heap Total: ", formatBytes(memoryUsage.heapTotal));
    console.log("Heap Used: ", formatBytes(memoryUsage.heapUsed));
    console.log("External: ", formatBytes(memoryUsage.external));
    
    console.log("CPU Usage: ");
    const formattedCpuUsage = formatCpuUsage(cpuUsage);
    console.log("User: ", formattedCpuUsage.user);
    console.log("System: ", formattedCpuUsage.system);
    console.log("Total: ", formattedCpuUsage.total);
    console.log("Load Average (1m, 5m, 15m): ", loadAverage.map(avg => avg.toFixed(2)).join(', '));
    console.log("Process CPU Usage: ", formatBytes(pidUsage.cpu)); // This gives CPU usage as a percentage
    
    console.log("Server is running smoothly. \n\n");

    return {
        message: "Odysseum Server is running smoothly.",
        currentTime: `Current Time: ${currentTime.toLocaleString()}`,
        uptime: `Server Uptime: ${formattedUptime}`,
        memoryUsage: {
            rss: formatBytes(memoryUsage.rss),
            heapTotal: formatBytes(memoryUsage.heapTotal),
            heapUsed: formatBytes(memoryUsage.heapUsed),
            external: formatBytes(memoryUsage.external)
        },
        cpuUsage: {
            ...formattedCpuUsage,
            loadAverage: loadAverage.map(avg => avg.toFixed(2)),
            processCpu: pidUsage.cpu
        }
    };
}