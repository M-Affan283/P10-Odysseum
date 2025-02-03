/*
    Filename: getBusiness.js
    Author: Affan
*/

import { Business } from "../../models/Business.js";
import { Location } from "../../models/Location.js";
import { User } from "../../models/User.js";

const categories = [
  "Restaurant",
  "Hotel",
  "Shopping",
  "Fitness",
  "Health",
  "Beauty",
  "Education",
  "Entertainment",
  "Services",
  "Other",
];

/**
 * Get a business by its ID
 */
const getBusinessById = async (req, res) =>
{
  const { requestorId, businessId } = req.query;

  if(!businessId) return res.status(400).json({ error: "Please provide a business ID" });
  if(!requestorId) return res.status(400).json({ error: "Please provide a requestor ID" });

  try
  {
    const user = await User.findById(requestorId);
    if(!user) return res.status(404).json({ error: "User not found" });

    // Populate owner, locationId
    const business = await Business.findById(businessId).populate('ownerId', 'username email').populate('locationId', 'name');
    if(!business) return res.status(404).json({ error: "Business not found" });

    const retBusiness = {
      ...business._doc,
      bookmarked: user.bookmarks.includes(businessId),
    }

    return res.status(200).json({ message: "Business found", business: retBusiness });
  }
  catch(error)
  {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }

};

/**
 * Get all businesses by a specific location (also includes by search query)
 */
const getBusinessByLocation = async (req, res) =>
{
  const { locationId, page=1, searchParam="" } = req.query;

  if(!locationId) return res.status(400).json({ error: "Please provide a location ID" });

  let limit = 10;

  try
  {
    const location = await Location.findById(locationId);
    if(!location) return res.status(404).json({ error: "Location not found" });

    let skip = (page - 1) * limit;
    const businesses = await Business.find({ locationId: locationId, name: { $regex: searchParam, $options: 'i' } })
                                     .skip(skip)
                                     .limit(limit)
                                     .select('_id name category mediaUrls averageRating address');
    
    const totalBusinesses = await Business.countDocuments({ locationId: locationId, name: { $regex: searchParam, $options: 'i' } });

    return res.status(200).json({
      message: "Businesses found",
      businesses: businesses,
      currentPage: Number(page),
      totalPages: Math.ceil(totalBusinesses / limit),
    });

  }
  catch(error)
  {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all businesses by category (also includes by search query)
 */
const getBusinessByCategory = async (req, res) => {};

/**
 * Get business by search query
 */
const getBusinessBySearchQuery = async (req, res) =>
{
  const { searchParam="", page=1 } = req.query;

  if(!searchParam) return res.status(400).json({ error: "Please provide a search parameter" });
  let limit = 10;

  try
  {
    let skip = (page - 1) * limit;

    const businesses = await Business.find({ name: { $regex: searchParam, $options: 'i' } })
                                     .skip(skip)
                                     .limit(limit)
                                     .populate('locationId', 'name')
                                     .select('_id name category');
                                     
    
    const totalBusinesses = await Business.countDocuments({ name: { $regex: searchParam, $options: 'i' }});

    return res.status(200).json({
      message: "Businesses found",
      businesses: businesses,
      currentPage: Number(page),
      totalPages: Math.ceil(totalBusinesses / limit),
    });

  }
  catch(error)
  {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all businesses by user (also includes by search query)
 */
const getBusinessByUser = async (req, res) => 
{
  const { userId, page=1, searchParam="" } = req.query;

  if(!userId) return res.status(400).json({ error: "Please provide a user ID" });

  let limit = 10;

  try
  {
    const user = await User.findById(userId);
    if(!user) return res.status(404).json({ error: "User not found" });

    let skip = (page - 1) * limit;
    const businesses = await Business.find({ owner: userId, name: { $regex: searchParam, $options: 'i' } })
                                     .skip(skip)
                                     .limit(limit)
                                     .select('_id name category mediaUrls averageRating address');
    
    const totalBusinesses = await Business.countDocuments({ owner: userId, name: { $regex: searchParam, $options: 'i' } });

    return res.status(200).json({
      message: "Businesses found",
      businesses: businesses,
      currentPage: Number(page),
      totalPages: Math.ceil(totalBusinesses / limit),
    });

  }
  catch(error)
  {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all businesses by category and location (also includes by search query)
 */
const getBusinessByCategoryAndLocation = async (req, res) =>
{
  const { locationId, category, page=1, searchParam="" } = req.query;

  if(!locationId) return res.status(400).json({ error: "Please provide a location ID" });
  if(!category) return res.status(400).json({ error: "Please provide a category" });
  if(!categories.includes(category)) return res.status(400).json({ error: "Invalid category" });

  let limit = 10;

  try
  {
    const location = await Location.findById(locationId);
    if(!location) return res.status(404).json({ error: "Location not found" });

    let skip = (page - 1) * limit;
    const businesses = await Business.find({ locationId: locationId, category: category, name: { $regex: searchParam, $options: 'i' } })
                                     .skip(skip)
                                     .limit(limit)
                                     .select('_id name category mediaUrls averageRating address');
    
    const totalBusinesses = await Business.countDocuments({ locationId: locationId, category: category, name: { $regex: searchParam, $options: 'i' } });

    return res.status(200).json({
      message: "Businesses found",
      businesses: businesses,
      currentPage: Number(page),
      totalPages: Math.ceil(totalBusinesses / limit),
    });

  }
  catch(error)
  {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }

};

/**
 * Get business by heatmap score (popularity) and location
 */
const getBusinessByHeatmapScoreAndLocation = async (req, res) =>
{
  const { locationId } = req.query;

  if(!locationId) return res.status(400).json({ error: "Please provide a location ID" });

  try
  {
    const location = await Location.findById(locationId);
    if(!location) return res.status(404).json({ error: "Location not found" });

    const businesses = await Business.find({ locationId: locationId }).sort({ heatmapScore: -1 }).limit(5).select('_id name category mediaUrls averageRating address');
    return res.status(200).json(businesses);
  }
  catch(error)
  {
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Get all businesses (also includes by search query)
 */
const getAllBusinesses = async (req, res) => {};

/**
 * Get businesses near user location sorted by popularity (heatmap score)
*/
const getBusinessNearUser = async (req, res) => {};

/**
 * Get business analytics
 */
const getBusinessAnalytics = async (req, res) => {};

export {
  getBusinessById,
  getBusinessByLocation,
  getBusinessByCategory,
  getBusinessBySearchQuery,
  getBusinessByUser,
  getBusinessByCategoryAndLocation,
  getBusinessByHeatmapScoreAndLocation,
  getAllBusinesses,
  getBusinessNearUser,
  getBusinessAnalytics,
};
