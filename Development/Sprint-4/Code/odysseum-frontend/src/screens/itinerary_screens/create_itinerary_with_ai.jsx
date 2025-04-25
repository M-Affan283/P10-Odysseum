import React, { useContext } from 'react'
import CreateItineraryWithAIScreen from './CreateItineraryWithAIScreen'
import { TemplateContext } from '../../../app/itinerary/_layout'

const CreateItineraryWithAI = () => {
  const { selectedTemplate } = useContext(TemplateContext)

  return (
    <CreateItineraryWithAIScreen
        selectedTemplate={selectedTemplate}
    />
  );
};
export default CreateItineraryWithAI
