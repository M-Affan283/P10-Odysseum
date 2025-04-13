/*
    Filename: createLocation.js
    Author: Shahrez
    Description: Controller for creating a new location
*/

import { Location } from '../../models/Location.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants.js';

export const createLocation = async (req, res) => {
    try {
        const { name, description, latitude, longitude, imageUrl } = req.body;

        if (!name || !latitude || !longitude) {
            return res.status(400).json({
                success: false,
                message: 'Name, latitude, and longitude are required'
            });
        }

        // Check if location with the same name already exists
        const existingLocation = await Location.findOne({ name });
        if (existingLocation) {
            return res.status(400).json({
                success: false,
                message: 'A location with this name already exists'
            });
        }

        // Validate coordinates
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);
        
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({
                success: false,
                message: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180'
            });
        }

        // Create new location
        const newLocation = await Location.create({
            name,
            description: description || '',
            coordinates: {
                type: 'Point',
                coordinates: [lng, lat] // MongoDB uses [longitude, latitude] format
            },
            imageUrl: imageUrl || ''
        });

        return res.status(201).json({
            success: true,
            message: 'Location created successfully',
            location: newLocation
        });

    } catch (error) {
        console.error('Create location error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};