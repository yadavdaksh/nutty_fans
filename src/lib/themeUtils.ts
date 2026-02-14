/**
 * Theme Utility Functions
 * Helper functions to apply Figma theme consistently across components
 */

import { theme } from './theme';

/**
 * Get input field styles with focus handlers
 */
export const getInputStyles = () => ({
  base: {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.normal,
    border: `1px solid ${theme.colors.border.light}`,
    backgroundColor: theme.colors.background.white,
    color: theme.colors.text.primary,
    borderRadius: theme.spacing.borderRadius.lg,
  },
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = theme.colors.accent.purple;
    e.currentTarget.style.boxShadow = '0px 0px 0px 2px rgba(152, 16, 250, 0.2)';
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = theme.colors.border.light;
    e.currentTarget.style.boxShadow = 'none';
  },
});

/**
 * Get button styles based on variant
 */
export const getButtonStyles = (variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
  const base = {
    fontFamily: theme.typography.fontFamily.primary,
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    borderRadius: theme.spacing.borderRadius.sm,
    transition: 'all 0.2s',
  };

  switch (variant) {
    case 'primary':
      return {
        ...base,
        background: theme.gradients.primary,
        color: theme.colors.text.white,
        boxShadow: theme.shadows.lg,
      };
    case 'secondary':
      return {
        ...base,
        backgroundColor: theme.colors.background.white,
        color: theme.colors.text.primary,
        border: `1px solid ${theme.colors.border.light}`,
      };
    case 'outline':
      return {
        ...base,
        backgroundColor: 'transparent',
        color: theme.colors.text.primary,
        border: `1px solid ${theme.colors.border.dark}`,
      };
    default:
      return base;
  }
};

/**
 * Get card styles
 */
export const getCardStyles = () => ({
  backgroundColor: theme.colors.background.white,
  border: `1px solid ${theme.colors.border.light}`,
  borderRadius: theme.spacing.borderRadius.lg,
  boxShadow: theme.shadows.sm,
});

/**
 * Get text styles by type
 */
export const getTextStyles = (type: 'heading' | 'subheading' | 'body' | 'caption' = 'body') => {
  const base = {
    fontFamily: theme.typography.fontFamily.primary,
  };

  switch (type) {
    case 'heading':
      return {
        ...base,
        fontSize: theme.typography.fontSize['5xl'],
        fontWeight: theme.typography.fontWeight.normal,
        color: theme.colors.text.primary,
        lineHeight: theme.typography.lineHeight.tight,
      };
    case 'subheading':
      return {
        ...base,
        fontSize: theme.typography.fontSize['2xl'],
        fontWeight: theme.typography.fontWeight.normal,
        color: theme.colors.text.primary,
      };
    case 'body':
      return {
        ...base,
        fontSize: theme.typography.fontSize.base,
        fontWeight: theme.typography.fontWeight.normal,
        color: theme.colors.text.secondary,
        lineHeight: theme.typography.lineHeight.normal,
      };
    case 'caption':
      return {
        ...base,
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.normal,
        color: theme.colors.text.muted,
      };
    default:
      return base;
  }
};
