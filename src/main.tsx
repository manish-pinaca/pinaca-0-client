import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import App from "./App.tsx";
import { store } from "./app/store.ts";
import { Toaster } from "./components/ui/toaster.tsx";
import "./index.css";
import { SocketProvider } from "./context/SocketContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Provider store={store}>
      <SocketProvider>
        <App />
      </SocketProvider>
      <Toaster />
    </Provider>
  </BrowserRouter>
);
