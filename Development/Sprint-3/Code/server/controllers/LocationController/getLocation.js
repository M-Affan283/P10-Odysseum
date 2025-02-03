// File: controllers/getLocation.js

//author: Luqman, Shahrez, Affan

import { Location } from "../../models/Location.js";
import { User } from "../../models/User.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../utils/constants.js";


/**
 * Get all locations.
*/
const getAllLocations = async (req,res) =>
{
    try
    {
        const locations = await Location.find({});
        return res.status(200).json({message: SUCCESS_MESSAGES.USERS_FOUND, locations: locations});

    }
    catch(error)
    {
        console.log(error);
        return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
    }

}

/**
 * Search for locations by name or description.
*/

const searchLocations = async (req, res) => 
{

  const { searchParam="", page=1 } = req.query;

  if(!searchParam) return res.status(400).json({error: "This api requires a search parameter"});
  
  let limit = 10;

  try
  {
    let skip = (page - 1) * limit;

    const locations = await Location.find({name: { $regex: searchParam, $options: 'i' }}).skip(skip).limit(limit).select('_id name');
    
    const totalLocations = await Location.countDocuments({name: { $regex: searchParam, $options: 'i' }});

    return res.status(200).json({
      message: "Locations found",
      locations: locations,
      currentPage: Number(page),
      totalPages: Math.ceil(totalLocations / limit)
    });

  } 
  catch(error)
  {
    console.log(error);
    return res.status(500).json({ error: ERROR_MESSAGES.SERVER_ERROR });
  }
};

/**
 * Get location by id.  
*/
const getLocationById = async (req, res) =>
{
  const { locationId, requestorId } = req.query;

  try
  {
    const user = await User.findById(requestorId);
    if(!user) return res.status(404).json({error: ERROR_MESSAGES.USER_NOT_FOUND});

    const location = await Location.findById(locationId);

    if(!location) return res.status(404).json({error: ERROR_MESSAGES.LOCATION_NOT_FOUND});

    const retLocation = {
      ...location._doc,
      bookmarked: user.bookmarks.includes(locationId)
    }

    return res.status(200).json({location: retLocation});
  }
  catch(error)
  {
    console.log(error);
    return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
  }
}

/**
 * Get top 5 popular locations. (based on average rating and heatmap score) 
*/
const getPopularLocations = async (req, res) =>
{
  try
  {
    const locations = await Location.find({}).sort({averageRating: -1, heatmapScore: -1}).limit(5).select('_id name');
    return res.status(200).json({locations: locations});
  }
  catch(error)
  {
    console.log(error);
    return res.status(500).json({error: ERROR_MESSAGES.SERVER_ERROR});
  }
}

export { getAllLocations, searchLocations, getLocationById, getPopularLocations };
