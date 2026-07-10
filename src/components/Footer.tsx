import React from 'react';
import { LinkedInIcon, InstagramIcon, FacebookIcon, DiscordIcon } from "@/components/icons/SocialIcons";


const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'black',
      color: 'white',
      textAlign: 'center',
      padding: '40px 20px',
    }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{
          fontSize: '1.8em', 
          fontWeight: 'bold',
          letterSpacing: '2px', 
          marginBottom: '20px'
        }} className='font-offbit-dot font-bold'>
          MONASH NEXUS FOR EMERGING TECHNOLOGIES
        </h2>
        <p style={{
          fontSize: '1.5em', 
          marginBottom: '30px'
        }} className='font-offbit font-bold'>
          JOIN US, <br />BUILD THE FUTURE
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <a href="https://au.linkedin.com/company/monashemergingtech" style={{ marginRight: '20px', color: 'white', fontSize: '1.5em' }} aria-label="LinkedIn"><LinkedInIcon className="w-[1em] h-[1em] inline-block align-[-0.125em]" /></a>
        <a href="https://www.instagram.com/monashemergingtech/" style={{ marginRight: '20px', color: 'white', fontSize: '1.5em' }} aria-label="Instagram"><InstagramIcon className="w-[1em] h-[1em] inline-block align-[-0.125em]" /></a>
        <a href="https://www.facebook.com/people/Monash-Nexus-for-Emerging-Technologies/61562647665251/" style={{ marginRight: '20px', color: 'white', fontSize: '1.5em' }} aria-label="Facebook"><FacebookIcon className="w-[1em] h-[1em] inline-block align-[-0.125em]" /></a>
        <a href="https://discord.gg/hFxzMnxgbK" style={{ color: 'white', fontSize: '1.5em' }} aria-label="Discord"><DiscordIcon className="w-[1.2em] h-[1em] inline-block align-[-0.125em]" /></a>
      </div>

      <p style={{ fontSize: '0.9em', letterSpacing: '2px' }} className='font-offbit font-bold' suppressHydrationWarning>
        © {new Date().getFullYear()} Monash Nexus for Emerging Technologies
      </p>
    </footer>
  );
};

export default Footer;
