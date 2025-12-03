import { AppProviders } from "./providers/AppProviders";
import Router from "./router/Router";

export default function App() {
  return (
    <AppProviders>
      <Router />
    </AppProviders>
  );
}
