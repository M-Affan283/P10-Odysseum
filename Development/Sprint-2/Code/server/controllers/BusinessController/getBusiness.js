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
const getBusinessById = async (req, res) => {};

/**
 * Get all businesses by a specific location (also includes by search query)
 */
const getBusinessByLocation = async (req, res) => {};

/**
 * Get all businesses by category (also includes by search query)
 */
const getBusinessByCategory = async (req, res) => {};

/**
 * Get business by search query
 */
const getBusinessBySearchQuery = async (req, res) => {};

/**
 * Get all businesses by user (also includes by search query)
 */
const getBusinessByUser = async (req, res) => {};

/**
 * Get all businesses by category and location (also includes by search query)
 */
const getBusinessByCategoryAndLocation = async (req, res) => {};

/**
 * Get business by heatmap score and location
 */
const getBusinessByHeatmapScoreAndLocation = async (req, res) => {};

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
