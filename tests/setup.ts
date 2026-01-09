import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock Electron APIs if needed
global.window = global.window || {};

// Polyfill TextEncoder/TextDecoder for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;
