import React, { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="/quiz-biz-simple-logo.png" alt="Quiz-Biz Logo" className='nav-logo'/>
      </div>
      <div className="menu-icon" onClick={toggleMenu}>
        {/* Hamburger icon for mobile view */}
        {isOpen ? '✕' : '☰'} 
      </div>
      <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
        <li>
          <a href="/">The Quiz</a>
        </li>
        <li>
          <a href="/about">Leaderboards</a>
        </li>
        <li>
          <a href="/contact">Your Scores</a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
