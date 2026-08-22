import { HttpContextToken } from '@angular/common/http';
// HttpContextToken: A key used to pass extra information with an HTTP request,
// such as whether to show a loader or skip an interceptor.
export const SKIP_AUTH = new HttpContextToken<boolean>(() => false);
