import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import BottomBar from "../components/BottomBar";

const AppLayout: React.FC = () => (
  <div>
    <Header />
    <Outlet />
    <BottomBar />
  </div>
);

export default AppLayout;
