/*
    Author: Haroon Khawaja
*/
import { Itinerary } from "../../models/Itinerary.js";
import { spawn } from "child_process";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../utils/constants.js";
import fs from "fs";

const normalizeTime = (hours, minutes) => {
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    if (minutes >= 60) {
        hours += Math.floor(minutes, 10);
        minutes = minutes % 60;
    }

    return { hours, minutes };
}

const createItinerary = async (req, res) => {
    const { destinations, template_id } = req.body
    if (!destinations || !Array.isArray(destinations) || destinations.length < 2) {
        return res.status(400).json({ 
            message: ERROR_MESSAGES.INVALID_ITINERARY
        })
    }
    try {
        // Normalizing and sorting data
        const sortedDestinations = destinations.map(dest => {
            const { hours, minutes } = normalizeTime(dest.time.hours, dest.time.minutes);
            return {
                ...dest,
                day: parseInt(dest.day, 10),
                time: { hours, minutes },
            };
        }).sort((a, b) => (a.day - b.day) || (a.time.hours - b.time.hours) || (a.time.minutes - b.time.minutes));
        
        // Formatting data
        const formattedItinerary = {};
        sortedDestinations.forEach(dest => {
            const dayKey = `Day ${dest.day}`;
            const timeStr = `${String(dest.time.hours).padStart(2, '0')}:${String(dest.time.minutes).padStart(2, '0')}`;
            const description = `${timeStr} - ${dest.destination}: ${dest.description}`;

            if (!formattedItinerary[dayKey]) {
                formattedItinerary[dayKey] = [];
            }
            formattedItinerary[dayKey].push(description);
        });

        // Creating a new itinerary instance and saving to database
        const newItinerary = await Itinerary.create({ destinations: sortedDestinations });
        const formattedItineraryJSON = JSON.stringify(formattedItinerary);

        const pythonScriptPath = "./llm_component/basic_itinerary.py";
        const pythonProcess = spawn("python", [pythonScriptPath, formattedItineraryJSON, template_id.toString()]);

        let result = "";
        let errorOutput = "";

        pythonProcess.stdout.on("data", (data) => {
            result += data.toString();
        });

        pythonProcess.stderr.on("data", (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on("close", (code) => {
            if (code === 0) {
                try {
                    console.log("Python Output:", result);
                    const jsonResponse = JSON.parse(result);
                    const imagePath = jsonResponse.image_path;

                    if (!fs.existsSync(imagePath)) {
                        return res.status(500).json({ message: "Generated image not found" });
                    }

                    res.sendFile(imagePath, (err) => {
                        if (err) {
                            console.error("Error sending image:", err);
                            res.status(500).json({ message: "Failed to send image" });
                        }
                    });

                } catch (parseError) {
                    console.error("Error parsing Python output:", parseError);
                    res.status(500).json({ message: "Error parsing Python script response" });
                }
            } else {
                console.error("Python Error:", errorOutput);
                res.status(500).json({ message: "Python script error" });
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR });
    }
};

export default createItinerary;