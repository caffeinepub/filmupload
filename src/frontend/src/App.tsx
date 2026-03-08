import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { BackToTop } from "./components/BackToTop";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { BrowsePage } from "./pages/BrowsePage";
import { FilmDetailPage } from "./pages/FilmDetailPage";
import { UploadPage } from "./pages/UploadPage";

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <Outlet />
      <Footer />
      <Toaster richColors position="bottom-right" />
      <BackToTop />
    </div>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: BrowsePage,
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/upload",
  component: UploadPage,
});

const filmDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/film/$id",
  component: FilmDetailPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  uploadRoute,
  filmDetailRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
