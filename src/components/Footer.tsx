import { SocialIcon } from 'react-social-icons/component';

const Footer = () => (
  <footer className="text-sm text-foreground/60 flex items-center justify-between gap-4 py-8 mt-auto">
    <p className="muted">© 2025 Livefol.io</p>
    <div className="flex items-center gap-4">
      <SocialIcon
        url="https://github.com/redrossa/livefolio"
        bgColor="transparent"
        fgColor="currentColor"
      />
    </div>
  </footer>
);

export default Footer;
