import { HttpInterceptorFn } from '@angular/common/http';
import { retry, timer } from 'rxjs';
/**
 * 502 Bad Gateway - 
 * 503 Service Unavailable - server is starting/restarting/temporarily down for maintenance.
 * 504 Gateway Timeout — a proxy/gateway waited for the upstream server to respond and it took too long.
 */
export const RETRYABLE_STATUS = [502, 503, 504];

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  if(req.method !== 'GET'){
    return next(req)
  }

  return next(req).pipe(
    retry({
      count:3,
      delay:(error, retryCount)=>{
        if(!RETRYABLE_STATUS.includes(error.status)){
          throw error; // not transient — stop immediately, don't retry 400/401/404
        }
        return timer(retryCount * 1000) // 1s, 2s, 3s linear backoff
      }
    })
  );
};
