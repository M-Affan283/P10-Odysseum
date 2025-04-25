/*
    Author: Haroon Khawaja
*/
import mongoose from "mongoose";

const templateSchema = new mongoose.Schema({
    template_id: String,
    name: String,
    image: Buffer, 
    type: String,
});

export const Template = mongoose.model("Template", templateSchema, "Template");