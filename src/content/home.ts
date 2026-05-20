import type { ApplyContent, HomeContent } from "@/content/types";

export const siteMetadata = {
  siteUrl: "https://monashemerging.tech",
  title: "Monash Nexus for Emerging Technologies",
  description:
    "A dynamic student team dedicated to exploring and advancing the frontiers of technology, our mission is to push the boundaries of innovation.",
  themeColor: "#DC003B",
  ogImage: "/img/logo.webp",
};

export const homeContent: HomeContent = {
  nav: {
    contactHref: "mailto:mnet@monash.edu",
    joinHref:
      "https://docs.google.com/forms/d/e/1FAIpQLSej1jyIYU_dy2uJqEs5zUvNY1GUN-6eN2DqxCbb2ucnYrTI7Q/viewform",
    menuGroups: [
      {
        links: [
          {
            label: "About",
            href: "https://www.canva.com/design/DAHA4J-hKD4/4adI4IB-DoOC1ohieiwEQQ/edit?utm_content=DAHA4J-hKD4&utm_campaign=designshare&utm_medium=link2&utm_source=sharebutton",
          },
          {
            label: "Projects",
            href: "https://www.monash.edu/monash-innovation-labs/facilities/mil-shared-facilities/monash-smart-manufacturing",
          },
          {
            label: "Events",
            href: "https://www.monash.edu/it/hcc/embodied-visualisation",
          },
          {
            label: "Meet the Team",
            href: "https://sites.google.com/monash.edu/virtual-and-augmented-reality/home?authuser=0",
          },
        ],
      },
    ],
  },
  hero: {
    recruitHref: "https://www.monash.edu/it/student-teams",
    recruitLabel: "MNET IS RECRUITING NOW!",
    recruitSuffix: "Join the emerging digital frontier!",
    heading: "MONASH NEXUS FOR EMERGING TECHNOLOGIES",
    subheading: "A Monash University research and education group.",
    ctaLabel: "JOIN NOW",
    ctaHref: "https://team.monashemerging.tech/apply",
    typewriterWords: [
      "Virtual Reality",
      "3D Modelling",
      "Motion Capture",
      "Web Development",
      "Augmented Reality",
      "World Building",
      "Quantum Computing",
      "Virtual Productions",
      "Digital Twinning",
      "Game Development",
      "Human Computer Interaction",
      "Robotics",
    ],
    timer: {
      eventStartIso: "2026-03-09T19:00:00+11:00",
      eventDurationDays: 4,
      liveMessage: "Orientation Week is live!",
      postMessage: "Thanks for attending O-Week!",
    },
  },
  projects: {
    heading: "Projects",
    subheading: "A slice of our work, expanding the horizons of technology.",
    items: [
      {
        title: "Monash Boring (MBEST) x MNET - Digital Prototyping",
        tags: "VR · Visualisation · Unity · 3D",
        mediaType: "video",
        mediaSrc: "/img/projects/mbest.mp4",
        mediaAlt: "MBEST digital prototyping video",
        titleClassName: "mr-14 tracking-wide",
        bodyClassName: "p-4 md:text-left",
        mediaClassName: "brightness-50",
      },
      {
        title: "Monash Pilot Processes (MPP) x MNET - Digital Twin",
        tags: "Prototyping · VR · Digital Twin · 3D",
        mediaType: "image",
        mediaSrc: "/img/projects/MPP.webp",
        mediaAlt: "Monash Pilot Processes project",
        mediaClassName: "brightness-50",
      },
      {
        title:
          "Monash Sustainable Buildings (MSB) x MNET - Visualisation and AR",
        tags: "Sustainability · AR · Data Visualisation · 3D",
        mediaType: "image",
        mediaSrc: "/img/projects/MSB.webp",
        mediaAlt: "Monash Sustainable Buildings project",
      },
      {
        title:
          "Embodied Visualisation x MNET - Globes : Explore Historical Maps",
        tags: "VR · Visualisation · Unity · 3D",
        mediaType: "image",
        mediaSrc: "/img/projects/phone-xr.webp",
        mediaAlt: "XR phone project preview",
        mediaClassName: "brightness-75",
      },
    ],
  },
  values: {
    heading: "OUR VALUES",
    cards: [
      {
        id: "card1",
        imageSrc: "/img/cards/card1.png",
        imageAlt: "Values card one",
      },
      {
        id: "card2",
        imageSrc: "/img/cards/card2.png",
        imageAlt: "Values card two",
      },
      {
        id: "card3",
        imageSrc: "/img/cards/card3.png",
        imageAlt: "Values card three",
      },
    ],
  },
  education: {
    heading: "Education",
    subheading: "Providing the next generation with the skills to lead.",
    items: [
      {
        dateIso: "2024-07-05",
        dateLabel: "7 / 5 / 2024",
        title: "MNET x MAC SPLINE WORKSHOP",
        description:
          "Worked with Monash University's largest I.T student club to deliver a workshop teaching the fundamentals of 3D.",
        imageSrc: "/img/education/mac-spline/spline-mac-1.webp",
        imageAlt: "Photo of MNET x SPLINE workshop",
      },
      {
        dateIso: "2024-07-06",
        dateLabel: "7 / 6 / 2024",
        title: "MACROB HIGH SCHOOL OUTREACH PROGRAM",
        description:
          "Facilitated immersive VR demos for Mac.Rob Girls' High School students in experimental economics at MonLEE excursion day.",
        imageSrc: "/img/education/macrob/macrob.webp",
        imageAlt: "Photo of MacRob high school outreach program",
      },
    ],
  },
  equipment: {
    heading: "Equipment",
    items: [
      {
        label: "APPLE VISION PRO",
        href: "https://www.apple.com/au/apple-vision-pro",
        imageSrc: "/img/equipment/vision_pro.webp",
        imageAlt: "Apple Vision Pro Headset",
        featured: true,
        cardClassName: "rounded-2xl backdrop-blur-xl",
        titleClassName: "text-xl md:mt-16",
        imageClassName: "h-32 w-auto md:h-auto md:w-full",
      },
      {
        label: "QUEST PRO",
        href: "https://www.meta.com/au/quest/quest-pro/",
        imageSrc: "/img/equipment/quest-pro-1.webp",
        imageAlt: "Meta Quest Pro Headset",
        cardClassName: "rounded-lg",
        titleClassName: "text-lg md:mt-16",
        imageClassName: "h-16 w-auto md:h-40",
      },
      {
        label: "HOLOLENS 2",
        href: "https://www.microsoft.com/en-us/hololens",
        imageSrc: "/img/equipment/holo-lens-2.webp",
        imageAlt: "Microsoft Hololens 2 Headset",
        cardClassName: "rounded-lg backdrop-blur-[5.9px]",
        titleClassName: "text-lg md:mt-16",
        imageClassName: "h-24 w-auto md:h-56",
      },
      {
        label: "INSTA360 PRO 2",
        href: "https://www.insta360.com/product/insta360-pro2",
        imageSrc: "/img/equipment/insta360_pro_2.webp",
        imageAlt: "Insta360 Pro 2 Camera",
        cardClassName: "rounded-lg backdrop-blur-[5.9px]",
        titleClassName: "text-lg md:mt-16",
        imageClassName: "h-32 w-auto md:h-[23rem]",
      },
      {
        label: "VIVE TRACKER 3.0",
        href: "https://www.vive.com/us/accessory/tracker3/",
        imageSrc: "/img/equipment/vivetracker.webp",
        imageAlt: "HTC Vive Tracker 3.0",
        cardClassName: "rounded-lg backdrop-blur-[5.9px]",
        titleClassName: "text-lg md:mt-16",
        imageClassName: "h-24 w-auto md:h-56",
      },
    ],
  },
  footer: {
    titleMobile: "MNET",
    titleDesktop: "MONASH NEXUS FOR EMERGING TECHNOLOGIES",
    tagline: "JOIN US, BUILD THE FUTURE",
    socials: [
      {
        label: "LinkedIn",
        href: "https://au.linkedin.com/company/monashemergingtech",
        icon: "linkedin",
      },
      {
        label: "Instagram",
        href: "https://www.instagram.com/monashemergingtech/",
        icon: "instagram",
      },
      {
        label: "Facebook",
        href: "https://www.facebook.com/people/Monash-Nexus-for-Emerging-Technologies/61562647665251/",
        icon: "facebook",
      },
      {
        label: "Discord",
        href: "https://discord.gg/hFxzMnxgbK",
        icon: "discord",
      },
    ],
  },
};

export const tickerMessages = [
  "Scroll down",
  "Défilez vers le bas",
  "Scorrere verso il basso",
  "Deslize para baixo",
  "スクロールダウン",
  "스크롤 다운",
];

export const applyContent: ApplyContent = {
  title: "Apply",
  iframeSrc:
    "https://airtable.com/embed/appVDxXMqQfTshdy5/pagJtk0nv32ew5HqX/form?autoResize=true",
};

export const organizationJsonLd = {
  "@context": "http://schema.org",
  "@type": "Organization",
  name: "Monash Nexus For Emerging Technologies",
  url: "https://monashemerging.tech",
  logo: "https://monashemerging.tech/img/logo.webp",
  sameAs: [
    "https://www.facebook.com/monashemergingtech/",
    "https://www.instagram.com/monashemergingtech/",
    "https://www.linkedin.com/company/98982050",
  ],
};
