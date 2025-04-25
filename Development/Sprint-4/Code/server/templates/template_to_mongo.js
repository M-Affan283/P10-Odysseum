/*
    Author: Haroon Khawaja
*/
import dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { Template } from "../models/Template.js"

dotenv.config({ path: '../config.env' });

async function saveTemplateToDB() {
    const environment = process.argv[2] || 'remote';
    const MONGO_URI = environment === 'local' ? process.env.MONGODB_URI_LOCAL : process.env.MONGODB_URI_REMOTE;
    
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB:", environment);

        const templatedDir = path.resolve();
        const files = fs.readdirSync(templatedDir);
        const docTemplates = files.filter((file) =>
            file.toLowerCase().endsWith(".png")
        )
        let id = 1
        for (const file of docTemplates) {
            const name = path.basename(file, ".png");
            const imagePath = path.join(templatedDir, file);
            const imageBuffer = fs.readFileSync(imagePath);

            await Template.updateOne(
                { template_id: id.toString() },
                {
                    $set: {
                        template_id: id.toString(),
                        name,
                        image: imageBuffer,
                        type: "image/png",
                    },
                },
                { upsert: true }
            );

            console.log("Saved template:", name, "(ID:", id, ")");
            id++;
        }
    } catch (error) {
        console.log("Error saving template:", error)
    } finally {
        mongoose.connection.close();
    }
}

saveTemplateToDB();