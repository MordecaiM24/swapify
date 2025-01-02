import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "@/components/mode-toggle";
import { Route, Routes } from "react-router-dom";
import { BrowserRouter } from "react-router-dom";
import { Navbar } from "./components/navbar";

import Login from "./auth/login";
import Listings from "./books/listings";
import Chat from "./chat/chat";
import User from "./auth/user";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Listings />} />
              <Route path="/auth" element={<Login />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/user" element={<User />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
      <ModeToggle />
    </ThemeProvider>
  );
}

export default App;
