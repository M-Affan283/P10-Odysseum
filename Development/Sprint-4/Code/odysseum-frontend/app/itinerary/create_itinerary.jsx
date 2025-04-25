import React, { useContext } from 'react'
import CreateItineraryScreen from '../../src/screens/itinerary_screens/CreateItineraryScreen'
import { TemplateContext } from './_layout'

const CreateItinerary = () => {
  const { selectedTemplate } = useContext(TemplateContext)
  return (
    <CreateItineraryScreen 
      selectedTemplate={selectedTemplate}
    />
  );
};
export default CreateItinerary