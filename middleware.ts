import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/profile(.*)",
  "/account(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // If route is protected and user is not signed in → redirect them
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      const session = await auth();
      return session.redirectToSignIn({ returnBackUrl: req.url });
    }
  }
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};

