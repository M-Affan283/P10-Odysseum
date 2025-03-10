/*
    Author: Haroon Khawaja
*/
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "../../utils/constants.js";
import { spawn } from "child_process";
import fs from "fs";

const createOptimizedItinerary = async (req, res) => {
    const { query, template_id } = req.body;
    
    if (!query || template_id === undefined) {
        return res.status(400).json({ message: "Missing 'query' or 'template' in request body" });
    }
    try {
        const pythonScriptPath = "./llm_component/ai_itinerary_components.py";
        const pythonProcess = spawn("python", [pythonScriptPath, query, template_id.toString()]);

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
export default createOptimizedItinerary;