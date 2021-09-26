import * as React from "react";
import "./index.css";
import { render } from "react-dom";
import * as serviceWorker from "./serviceWorker";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "./chakra-ui/theme";

import App from "./App";

const rootElement = document.getElementById("root");
render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>,
  rootElement
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
