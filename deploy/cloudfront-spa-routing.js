// CloudFront Function (viewer request) for the frontend distribution.
// Paste into CloudFront > Functions, publish it, then attach it to the DEFAULT (*) behavior.
// Works for both the React and Angular builds.
function handler(event) {
    var request = event.request;
    var uri = request.uri;

    // Leave API requests untouched.
    // They are handled by the /api/* behavior (load balancer -> ECS).
    if (uri === '/api' || uri.startsWith('/api/')) {
        return request;
    }

    // Serve the SPA's entry point for frontend routes (e.g. /dashboard on refresh).
    // Preserve real file requests such as JS, CSS, images, fonts, and the favicon.
    var lastSegment = uri.substring(uri.lastIndexOf('/') + 1);

    if (lastSegment.indexOf('.') === -1) {
        request.uri = '/index.html';
    }

    return request;
}
