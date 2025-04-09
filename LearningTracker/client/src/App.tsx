import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Category from "@/pages/category";
import AppLayout from "@/layouts/app-layout";
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/category/:id" component={Category} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <AppLayout>
          <Router />
        </AppLayout>
        <Toaster />
      </QueryClientProvider>
    </I18nextProvider>
  );
}

export default App;
