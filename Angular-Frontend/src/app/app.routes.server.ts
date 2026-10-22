import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // public pages can be built ahead of time!
  { path: 'login', renderMode: RenderMode.Prerender },
  { path: 'register', renderMode: RenderMode.Prerender },
  
  // logged in page needs the token in the brower, so render them here
  { path: '**', renderMode: RenderMode.Client }
];