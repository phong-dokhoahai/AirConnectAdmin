import { HashRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import PlansList from "./pages/Plans/PlansList";
import PlanEditor from "./pages/Plans/PlanEditor";
import Revenue from "./pages/Revenue/Revenue";
import Orders from "./pages/Orders/Orders";
import ProtectedRoute from "./routes/ProtectedRoute";
import { AuthProvider } from "./lib/auth";
import { I18nProvider } from "./lib/i18n";

export default function App() {
  return (
    <I18nProvider>
      <Router>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index path="/" element={<Home />} />
                <Route path="/plans" element={<PlansList />} />
                <Route path="/plans/new" element={<PlanEditor />} />
                <Route path="/plans/:id" element={<PlanEditor />} />
                <Route path="/revenue" element={<Revenue />} />
                <Route path="/orders" element={<Orders />} />
              </Route>
            </Route>

            <Route path="/signin" element={<SignIn />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </I18nProvider>
  );
}
