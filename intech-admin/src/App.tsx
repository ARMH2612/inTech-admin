import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { AppRouter } from "./components/Router";
import { store } from "./state";

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </Provider>
  );
}
