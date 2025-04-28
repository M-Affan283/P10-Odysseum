import React from 'react'
import PostDetailsScreen from '../../src/screens/PostDetailsScreen'
import { useLocalSearchParams } from 'expo-router'

const PostDetails = () => {
    const { id } = useLocalSearchParams()
    
  return (
    <PostDetailsScreen postId={id} />
  )
}

export default PostDetails