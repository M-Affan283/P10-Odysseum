/*
    Filename: updateLocation.js
    Author: Shahrez
    Description: Controller for updating a location
*/

import { Location } from '../../models/Location.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants.js';

export const updateLocation = async (req, res) => {
    try {
        const { locationId } = req.params;
        const { name, description, latitude, longitude, imageUrl } = req.body;

        if (!locationId) {
            return res.status(400).json({
                success: false,
                message: 'Location ID is required'
            });
        }

        // Find the location
        const location = await Location.findById(locationId);

        if (!location) {
            return res.status(404).json({
                success: false,
                message: 'Location not found'
            });
        }

        // Check if name is being changed and if it already exists
        if (name && name !== location.name) {
            const existingLocation = await Location.findOne({ name });
            if (existingLocation && existingLocation._id.toString() !== locationId) {
                return res.status(400).json({
                    success: false,
                    message: 'A location with this name already exists'
                });
            }
        }

        // Prepare update object
        const updateData = {};

        if (name) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (imageUrl) updateData.imageUrl = imageUrl;

        // Update coordinates if provided
        if (latitude !== undefined && longitude !== undefined) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            
            if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid coordinates. Latitude must be between -90 and 90, longitude between -180 and 180'
                });
            }

            updateData['coordinates.coordinates'] = [lng, lat]; // MongoDB uses [longitude, latitude] format
        }

        // Update the location
        const updatedLocation = await Location.findByIdAndUpdate(
            locationId,
            updateData,
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Location updated successfully',
            location: updatedLocation
        });

    } catch (error) {
        console.error('Update location error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};