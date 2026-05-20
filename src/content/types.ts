export interface NavExternalLink {
  label: string;
  href: string;
  labelLines?: string[];
}

export interface NavDropdownGroup {
  links: NavExternalLink[];
}

export interface SocialLink {
  label: string;
  href: string;
  icon: "linkedin" | "instagram" | "facebook" | "discord";
}

export interface HeroTimerConfig {
  eventStartIso: string;
  eventDurationDays: number;
  liveMessage: string;
  postMessage: string;
}

export interface HeroConfig {
  recruitHref: string;
  recruitLabel: string;
  recruitSuffix: string;
  heading: string;
  subheading: string;
  ctaLabel: string;
  ctaHref: string;
  typewriterWords: string[];
  timer: HeroTimerConfig;
}

export interface ProjectItem {
  title: string;
  tags: string;
  mediaType: "image" | "video";
  mediaSrc: string;
  mediaAlt: string;
  mediaClassName?: string;
  titleClassName?: string;
  bodyClassName?: string;
}

export interface ValueCard {
  id: string;
  imageSrc: string;
  imageAlt: string;
}

export interface EducationItem {
  dateIso: string;
  dateLabel: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

export interface EquipmentItem {
  label: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  featured?: boolean;
  cardClassName?: string;
  titleClassName?: string;
  imageClassName?: string;
}

export interface HomeContent {
  hero: HeroConfig;
  nav: {
    contactHref: string;
    joinHref: string;
    menuGroups: NavDropdownGroup[];
  };
  projects: {
    heading: string;
    subheading: string;
    items: ProjectItem[];
  };
  values: {
    heading: string;
    cards: ValueCard[];
  };
  education: {
    heading: string;
    subheading: string;
    items: EducationItem[];
  };
  equipment: {
    heading: string;
    items: EquipmentItem[];
  };
  footer: {
    titleMobile: string;
    titleDesktop: string;
    tagline: string;
    socials: SocialLink[];
  };
}

export interface ApplyContent {
  title: string;
  iframeSrc: string;
}
