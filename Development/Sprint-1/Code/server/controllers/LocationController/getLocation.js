// File: controllers/getLocation.js

//author: Luqman

import { Location } from "../../models/Location.js";
import { ERROR_MESSAGES } from "../../utils/constants.js";

/**
 * Search for locations by name or description.
 * @param {Object} req - Request object containing the search parameters.
 * @param {Object} res - Response object.
 */
export const searchLocations = async (req, res) => {
  const { searchParam, limit = 10, lastId } = req.body;

  if (!searchParam) return res.status(400).json({ error: ERROR_MESSAGES.NO_SEARCH_PARAM });

  try {
    const searchQuery = {
      name: { $regex: searchParam, $options: 'i' },
    };

    if (lastId) searchQuery._id = { $gt: lastId };

    const locations = await Location.find(searchQuery).limit(Number(limit)).sort({ _id: 1 }).exec();
    const hasMore = locations.length === Number(limit);

    return res.status(200).json({
      locations,
      pagination: {
        hasMore,
        lastId: locations.length > 0 ? locations[locations.length - 1]._id : null,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: ERROR_MESSAGES.SERVER_ERROR });
  }
};
