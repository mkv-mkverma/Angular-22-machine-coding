import { InjectionToken } from '@angular/core';
// InjectionToken is a unique key used to inject constant values like
// strings, objects, or configuration through Angular DI.
export const API_URL = new InjectionToken<string>('API_URL');
