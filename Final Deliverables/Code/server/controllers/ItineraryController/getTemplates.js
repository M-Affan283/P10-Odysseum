/*
    Author: Haroon Khawaja
*/
import { Template } from "../../models/Template.js"

const getTemplates = async (req, res) => {
    try {
        const allTemplates = await Template.find();
        if (allTemplates.length === 0) {
            return res.status(404).send({ message: "No templates found" });
        }
        const templateData = await Promise.all(allTemplates.map(async (template) => {
            const img = template.image.toString('base64');
            return {
                template_id: template.template_id,
                name: template.name,
                previewImage: `data:image/png;base64,${img}`,
                type: template.type,
            };
        }));
        res.status(200).json(templateData);
    } catch (error) {
        console.log("Error fetching templates:", error);
        res.status(500).send({ message: "Error fetching templates" });
    }
};

export default getTemplates;