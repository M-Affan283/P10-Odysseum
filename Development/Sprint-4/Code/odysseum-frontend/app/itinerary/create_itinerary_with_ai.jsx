import React, { useContext } from 'react'
import CreateItineraryWithAIScreen from '../../src/screens/itinerary_screens/CreateItineraryWithAIScreen'
import { TemplateContext } from './_layout'

const CreateItineraryWithAI = () => {
  const { selectedTemplate } = useContext(TemplateContext)

  return (
    <CreateItineraryWithAIScreen
        selectedTemplate={selectedTemplate}
    />
  );
};
export default CreateItineraryWithAI
