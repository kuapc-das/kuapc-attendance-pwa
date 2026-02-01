/**
 * Standardized Haptic Feedback Utility for KUAPC DAS
 */
export const Haptics = {
  /**
   * Short light tap for standard button interactions
   */
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(40);
    }
  },

  /**
   * Stronger single burst for success states
   */
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(150);
    }
  },

  /**
   * Double pulse for error or warning states
   */
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  },

  /**
   * Heavy burst for major actions
   */
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(250);
    }
  }
};