import React from "react";
import CustomerApp from "./CustomerApp.jsx";
import AdminApp from "./AdminApp.jsx";

export default function App() {
  const isAdmin = window.location.pathname.startsWith("/admin");
  return isAdmin ? <AdminApp /> : <CustomerApp />;
}
