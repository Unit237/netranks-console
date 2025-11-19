import OnboardingSessionInitializer from "./components/OnboardingSessionInitializer";
import { AppProviders } from "./providers/AppProviders";
import Router from "./router/Router";

export default function App() {
  return (
    <AppProviders>
      <OnboardingSessionInitializer />
      <Router />
    </AppProviders>
  );
}

//  <div className="min-h-screen flex flex-col items-center justify-center gap-6">
//       <h1 className="text-3xl font-bold">Tailwind v3 Light / Dark demo</h1>

//       <ThemeToggle />

//       <div className="space-x-3">
//         {/* using Tailwind arbitrary value syntax so colors come from CSS variables */}
//         <button className="bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2 rounded">
//           Primary (Tailwind utility)
//         </button>

//         {/* alternative: use the CSS helper class .btn-primary defined earlier */}
//         <button className="btn-primary">Primary (CSS helper)</button>
//       </div>

//       <p className="max-w-prose text-center">
//         Page background and text colors are controlled by CSS variables.
//       </p>
//     </div>
