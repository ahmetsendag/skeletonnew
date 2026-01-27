// Auto-import all image files dynamically using require.context
// Any .png, .jpg, .jpeg, .gif, or .webp file in subfolders will be automatically loaded
// No script needed - Metro bundler handles this at build time

import type { ImageSourcePropType } from 'react-native';

type ImageSource = ImageSourcePropType;

// Load all images from animals folder
const animalsContext = require.context('./animals', false, /\.(png|jpg|jpeg|gif|webp)$/);

// Load all images from culture folder
const cultureContext = require.context('./culture', false, /\.(png|jpg|jpeg|gif|webp)$/);

/**
 * Extract filename from require.context key
 * Example: "./bats.png" -> "bats.png"
 */
function getFilename(contextKey: string): string {
  return contextKey.replace('./', '');
}

// Build the animals image registry (keyed by filename)
const animalsRegistry: Record<string, ImageSource> = {};
animalsContext.keys().forEach((key) => {
  const filename = getFilename(key);
  animalsRegistry[filename] = animalsContext(key);
});

// Build the culture image registry (keyed by filename)
const cultureRegistry: Record<string, ImageSource> = {};
cultureContext.keys().forEach((key) => {
  const filename = getFilename(key);
  // Skip README and non-image files
  if (!filename.endsWith('.md')) {
    cultureRegistry[filename] = cultureContext(key);
  }
});

// Combined registry for backwards compatibility (animals only, matching old behavior)
const imageRegistry: Record<string, ImageSource> = { ...animalsRegistry };

// Full registry with all images organized by folder
const allImages = {
  animals: animalsRegistry,
  culture: cultureRegistry,
};

export { imageRegistry, animalsRegistry, cultureRegistry, allImages };
export default imageRegistry;
