/**
 * Luxury Animations Manager
 * Applies luxury animation classes to elements based on scroll position
 */

// Define key types for animation targets
type AnimationTargetKey = 'headings' | 'images' | 'sections' | 'cards' | 'lists' | 'buttons' | 'paragraphs' | 'highlights';

// Elements to observe for animation triggers
const animationTargets: Record<AnimationTargetKey, string> = {
  headings: '.animate-heading',
  images: '.animate-image',
  sections: '.animate-section',
  cards: '.animate-card',
  lists: '.animate-list-item',
  buttons: '.animate-button',
  paragraphs: '.animate-text',
  highlights: '.animate-highlight'
};

// Animation classes to apply based on element type
const animationClasses: Record<AnimationTargetKey, string> = {
  headings: 'text-reveal',
  images: 'image-reveal',
  sections: 'refined-fade',
  cards: 'hover-lift',
  lists: 'stagger-item',
  buttons: 'luxury-button',
  paragraphs: 'text-focus',
  highlights: 'gold-sparkle'
};

// Apply staggered delays to child elements
function applyStaggeredDelays(
  parentSelector: string, 
  childSelector: string, 
  delayClassPrefix: string, 
  maxItems: number = 10
): void {
  const containers = document.querySelectorAll(parentSelector);
  
  containers.forEach(container => {
    const items = container.querySelectorAll(childSelector);
    items.forEach((item: Element, index: number) => {
      if (index < maxItems) {
        item.classList.add(`${delayClassPrefix}-${(index % 3) + 1}`);
      } else {
        item.classList.add(`${delayClassPrefix}-${(index % 3) + 1}`);
      }
    });
  });
}

// Intersection Observer for triggering animations on scroll
function setupScrollAnimations(): void {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target;
        
        // Determine which animation class to apply
        Object.keys(animationTargets).forEach(key => {
          const animationKey = key as AnimationTargetKey;
          if (target.matches(animationTargets[animationKey])) {
            target.classList.add(animationClasses[animationKey]);
            
            // For staggered items, add the 'revealed' class
            if (animationKey === 'lists') {
              target.classList.add('revealed');
            }
          }
        });
        
        // Once animated, no need to observe anymore
        observer.unobserve(target);
      }
    });
  }, {
    threshold: 0.1,  // Trigger when at least 10% of the element is visible
    rootMargin: '0px 0px -10% 0px' // Slightly before element enters viewport
  });
  
  // Observe all animation targets
  Object.values(animationTargets).forEach(selector => {
    document.querySelectorAll(selector).forEach(element => {
      observer.observe(element);
    });
  });
}

// Apply hover effects that don't require scroll observation
function setupHoverEffects() {
  // Apply elegant underline effect to navigation links
  document.querySelectorAll('nav a:not(.btn-primary):not(.btn-secondary)').forEach(link => {
    link.classList.add('elegant-underline');
  });
  
  // Apply hover lift to product cards if not already applied
  document.querySelectorAll('.product-card:not(.hover-lift)').forEach(card => {
    card.classList.add('hover-lift');
  });
}

// Apply subtle animations to decorative elements
function setupDecorativeAnimations() {
  // Subtle rotation for decorative elements
  document.querySelectorAll('.decorative-element').forEach(element => {
    element.classList.add('subtle-rotate');
  });
  
  // Gold sparkle effect for special text
  document.querySelectorAll('.special-text, .sale-text, .discount-text').forEach(text => {
    text.classList.add('gold-sparkle');
  });
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Enable luxury smooth scrolling
  document.documentElement.classList.add('luxury-scroll');
  
  // Set up all animation systems
  setupScrollAnimations();
  setupHoverEffects();
  setupDecorativeAnimations();
  
  // Apply staggered delays
  applyStaggeredDelays('.staggered-container', '.stagger-item', 'refined-fade-delay');
  applyStaggeredDelays('.product-grid', '.product-card', 'image-reveal-delay');
  applyStaggeredDelays('.text-section', 'p', 'text-reveal-delay');
});

// Re-initialize animations when content changes (for SPA navigation)
document.addEventListener('luxuryContentChanged', () => {
  setupScrollAnimations();
  setupHoverEffects();
  setupDecorativeAnimations();
});

// Define interface for the exported API
interface LuxuryAnimationsAPI {
  refreshAnimations: () => void;
  applyTextReveal: (element: HTMLElement) => void;
  applyImageReveal: (element: HTMLElement) => void;
  applyStaggeredAnimations: (containerSelector: string, itemSelector: string) => void;
}

// Export animation helper functions for direct use
export const LuxuryAnimations: LuxuryAnimationsAPI = {
  refreshAnimations: (): void => {
    setupScrollAnimations();
    setupHoverEffects();
    setupDecorativeAnimations();
  },
  applyTextReveal: (element: HTMLElement): void => {
    element.classList.add('text-reveal');
  },
  applyImageReveal: (element: HTMLElement): void => {
    element.classList.add('image-reveal');
  },
  applyStaggeredAnimations: (containerSelector: string, itemSelector: string): void => {
    applyStaggeredDelays(containerSelector, itemSelector, 'refined-fade-delay');
  }
};

export default LuxuryAnimations;