import React from 'react'
import './Navigation.css'

function Navigation() {
  return (
    <>
      <div className='navigation'>
        <nav>
          <a className='active' href="#">About</a>
          <a href="#">Skills</a>
          <a href="#">Education</a>
          <a href="#">Contact</a>
        </nav>
      </div>
    </>
  )
}

export default Navigation
