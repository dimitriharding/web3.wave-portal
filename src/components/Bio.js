import React from "react";
import { Text, Center, Link } from "@chakra-ui/react";
const Bio = () => (
  <Center>
    <Text whiteSpace="pre-wrap">
      I am{" "}
      <Link
        target="_blank"
        color="blue.500"
        href="https://twitter.com/irtimid_harding"
      >
        dimitriharding
      </Link>
      , I live in Jamaica and I enjoy photography, traveling, and creating
      solutions to problems. {"\n\n"}This is my first dApp. Connect your
      Ethereum wallet and wave at me!
    </Text>
  </Center>
);

export default Bio;
