import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Mock Electron APIs if needed
global.window = global.window || {};

// Polyfill TextEncoder/TextDecoder for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock IndexedDB to prevent memory issues in tests
const mockIndexedDB = {
  open: jest.fn(() => {
    const request = {
      onerror: null as any,
      onsuccess: null as any,
      onupgradeneeded: null as any,
      error: null,
      result: {
        objectStoreNames: {
          contains: jest.fn(() => false)
        },
        createObjectStore: jest.fn(() => ({
          createIndex: jest.fn()
        })),
        transaction: jest.fn(() => ({
          objectStore: jest.fn(() => ({
            add: jest.fn(() => {
              const addRequest = {
                onsuccess: null as any,
                onerror: null as any
              };
              setTimeout(() => {
                if (addRequest.onsuccess) addRequest.onsuccess({ target: { result: 'mockId' } });
              }, 0);
              return addRequest;
            }),
            get: jest.fn(() => {
              const getRequest = {
                onsuccess: null as any,
                onerror: null as any,
                result: null
              };
              setTimeout(() => {
                if (getRequest.onsuccess) getRequest.onsuccess({ target: { result: null } });
              }, 0);
              return getRequest;
            }),
            delete: jest.fn(() => {
              const deleteRequest = {
                onsuccess: null as any,
                onerror: null as any
              };
              setTimeout(() => {
                if (deleteRequest.onsuccess) deleteRequest.onsuccess({ target: {} });
              }, 0);
              return deleteRequest;
            })
          }))
        }))
      }
    };
    
    // Simulate successful open
    setTimeout(() => {
      if (request.onupgradeneeded) {
        request.onupgradeneeded({ target: request } as any);
      }
      if (request.onsuccess) {
        request.onsuccess({ target: request } as any);
      }
    }, 0);
    
    return request;
  })
};

global.indexedDB = mockIndexedDB as any;
