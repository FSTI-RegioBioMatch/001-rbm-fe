import { HttpInterceptorFn } from '@angular/common/http';

export const currentCompanyInterceptor: HttpInterceptorFn = (req, next) => {
  const companyContext = localStorage.getItem('company_context');

  if (companyContext) {
    const clonedRequest = req.clone({
      headers: req.headers.set('Current-Company', companyContext),
    });
    return next(clonedRequest);
  }

  return next(req);
};
