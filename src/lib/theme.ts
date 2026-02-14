/**
 * NuttyFans Theme Configuration
 * Extracted from Figma Draft 6 Design System
 */

export const theme = {
  // Base Colors
  colors: {
    // Primary Text Colors
    text: {
      primary: '#101828',      // fill_VFDV1V - Main dark text
      secondary: '#4A5565',     // fill_YPLZLJ - Secondary text
      tertiary: '#364153',      // fill_HUG2G8 - Tertiary/darker gray text
      dark: '#0A0A0A',          // fill_OWNOJ6 - Very dark text (almost black)
      white: '#FFFFFF',         // fill_EI29YV - White text
      muted: '#6A7282',         // fill_O6WEMD - Muted text
    },
    
    // Background Colors
    background: {
      white: '#FFFFFF',         // fill_EI29YV - White background
      light: '#F9FAFB',         // fill_7IPFCU - Light gray background
      gray: '#F3F4F6',          // fill_4DX4ND - Gray background
      dark: '#444444',          // fill_IZXVC3 - Dark background
      black: '#000000',         // Pure black
      overlay: 'rgba(255, 255, 255, 0.8)', // fill_UKQVDI - White overlay with blur
      overlayDark: 'rgba(0, 0, 0, 0.2)',    // fill_T1Z94F - Dark overlay
      overlayDarkStrong: 'rgba(0, 0, 0, 0.5)', // fill_UVI03Q - Strong dark overlay
      overlayDarkStronger: 'rgba(0, 0, 0, 0.6)', // fill_K1R8DS - Very strong dark overlay
    },
    
    // Accent Colors
    accent: {
      purple: '#9810FA',        // Primary purple
      purpleLight: '#8200DB',   // fill_EP7XTJ - Light purple
      purpleDark: '#6D4ECC',    // fill_RLU80G - Dark purple
      pink: '#E60076',          // fill_DQ7OM0 - Pink
      blue: '#155DFC',          // fill_P060J3 - Blue
      green: '#00C950',         // fill_YWSOPX - Success green
      red: '#FB2C36',           // fill_26ZZY1 - Error red
      orange: '#E7000B',        // fill_QX0HN2 - Orange/red
    },
    
    // Border Colors
    border: {
      light: '#E5E7EB',         // stroke_K71W6I - Light gray border
      dark: 'rgba(0, 0, 0, 0.1)', // stroke_QBT8HV - Dark border with opacity
      purple: '#9810FA',        // stroke_SD3FUT - Purple border
      white: '#FFFFFF',         // stroke_KTZ1AS - White border
    },
    
    // Badge/Category Colors
    badge: {
      background: '#F3E8FF',    // fill_FUAXBK - Purple badge background
      border: '#E9D4FF',        // Badge border
      text: '#8200DB',          // fill_QKMNPJ - Purple badge text
    },
  },
  
  // Gradients
  gradients: {
    // Primary Button Gradient (NEW THEME)
    primary: 'linear-gradient(135deg, rgba(243, 117, 194, 1) 0%, rgba(177, 83, 215, 1) 34%, rgba(77, 47, 178, 1) 68%, rgba(14, 33, 160, 1) 100%)',
    
    // Purple-Pink Gradients (Various angles)
    purplePink90: 'linear-gradient(90deg, rgba(166, 195, 255, 1) 0%, rgba(134, 93, 255, 1) 100%)',
    purplePink135: 'linear-gradient(135deg, rgba(165, 193, 255, 1) 0%, rgba(134, 94, 254, 1) 100%)',
    purplePink146: 'linear-gradient(146deg, rgba(166, 194, 255, 1) 0%, rgba(135, 97, 254, 1) 100%)',
    purplePink173: 'linear-gradient(173deg, rgba(165, 192, 255, 1) 24%, rgba(135, 96, 254, 1) 100%)',
    
    // Subscribe Button Gradient
    subscribe: 'linear-gradient(90deg, rgba(165, 192, 254, 1) 0%, rgba(134, 93, 255, 1) 100%)',
    
    // Category Badge Gradient
    category: 'linear-gradient(90deg, rgba(166, 195, 255, 1) 0%, rgba(134, 93, 255, 1) 100%)',
    
    // Text Gradient (Connecting Fans)
    textGradient: 'linear-gradient(90deg, rgba(173, 70, 255, 1) 0%, rgba(227, 132, 255, 1) 50%, rgba(134, 93, 255, 1) 100%)',
    
    // Hero Background Gradient
    heroBackground: 'linear-gradient(135deg, rgba(250, 245, 255, 1) 0%, rgba(253, 242, 248, 1) 50%, rgba(255, 247, 237, 1) 100%)',
    
    // Hero Radial Gradients
    heroRadialPurple: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1) 0%, rgba(0, 0, 0, 0) 50%)',
    heroRadialPink: 'radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.1) 0%, rgba(0, 0, 0, 0) 50%)',
    
    // Subscription Tier Gradients
    tierBasic: 'linear-gradient(135deg, rgba(21, 93, 252, 1) 0%, rgba(0, 146, 184, 1) 100%)',
    tierPremium: 'linear-gradient(135deg, rgba(165, 193, 255, 1) 0%, rgba(134, 94, 254, 1) 100%)',
    tierVIP: 'linear-gradient(135deg, rgba(245, 73, 0, 1) 0%, rgba(231, 0, 11, 1) 100%)',
    
    // Stat Icon Backgrounds
    statIcon: 'linear-gradient(135deg, rgba(243, 232, 255, 1) 0%, rgba(252, 231, 243, 1) 100%)',
    
    // CTA Section Background
    ctaBackground: 'linear-gradient(135deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%)',
    
    // Overlay Gradients
    overlayDark: 'linear-gradient(0deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0) 100%)',
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: 'Inter, sans-serif',
      emoji: 'Segoe UI Emoji',
    },
    
    fontSize: {
      xs: '11.4px',      // style_TM8MQS - Category badges
      sm: '13px',        // style_NXXDVV - Button text
      sm2: '13.2px',     // style_FFY2WZ - Small text
      base: '14px',      // style_W8Z3K3 - Body text
      md: '15.1px',      // style_1D02X8 - Navigation text
      lg: '16px',        // style_GQFJ22 - Base text
      lg2: '16.7px',     // style_C0GVGW - Description text
      xl: '18px',        // style_BDRMKL - Username text
      xl2: '18.6px',     // style_NHC9RK - Description text
      '2xl': '24px',     // style_BEPCJL - Section headings
      '3xl': '28px',     // style_E7GBIV - Stat numbers
      '4xl': '30px',     // style_WVVQ0Z - Large headings
      '5xl': '32.2px',   // style_18VKCB - Section titles
      '6xl': '43.7px',   // style_5EL07J - CTA heading
      '7xl': '66.8px',   // style_B6CSQP - Hero heading
    },
    
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    
    lineHeight: {
      tight: '1.2em',
      normal: '1.5em',
      relaxed: '1.5555555555555556em',
    },
  },
  
  // Spacing & Layout
  spacing: {
    borderRadius: {
      sm: '8px',
      md: '10px',
      lg: '14px',
      xl: '16px',
      full: '9999px',    // Fully rounded
      circle: '16777200px', // Circle (very large radius)
    },
    
    borderWidth: {
      thin: '1px',
      medium: '2px',
      thick: '4px',
    },
  },
  
  // Shadows & Effects
  shadows: {
    sm: '0px 4px 6px -4px rgba(0, 0, 0, 0.1), 0px 10px 15px -3px rgba(0, 0, 0, 0.1)',
    md: '4px 4px 12px 0px rgba(0, 0, 0, 0.15)',
    lg: '0px 4px 12px rgba(0, 0, 0, 0.15)',
    purple: '0px 0px 0px 4px rgba(152, 16, 250, 1)',
    purpleGlow: '0px 4px 6px -4px rgba(173, 70, 255, 0.5), 0px 10px 15px -3px rgba(173, 70, 255, 0.5)',
  },
  
  // Effects
  effects: {
    backdropBlur: 'blur(24px)',
    blur: 'blur(100px)',
  },
};

// Helper function to get gradient style
export const getGradientStyle = (gradientName: keyof typeof theme.gradients) => {
  return {
    background: theme.gradients[gradientName],
  };
};

// Helper function to get color
export const getColor = (category: keyof typeof theme.colors, colorName: string) => {
  return theme.colors[category][colorName as keyof typeof theme.colors[typeof category]];
};

// Export individual color values for easy access
export const colors = theme.colors;
export const gradients = theme.gradients;
export const typography = theme.typography;
export const spacing = theme.spacing;
export const shadows = theme.shadows;
export const effects = theme.effects;
