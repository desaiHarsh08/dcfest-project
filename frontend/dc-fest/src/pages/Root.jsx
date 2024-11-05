import React from 'react'
import Navbar from '../components/Navbar/Navbar'
import AnimatedCarousel from '../components/root/AnimatedCarousel'
import EventLists from '../components/root/EventLists'

const Root = () => {
  return (
    <div className='vh-100'>
      <Navbar />
      <div style={{ }}>
        <AnimatedCarousel />
      </div>
      <EventLists/>
    </div>
  )
}

export default Root