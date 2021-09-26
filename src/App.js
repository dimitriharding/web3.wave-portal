import * as React from "react";
import { ethers } from "ethers";
import {
  Button,
  Heading,
  Container,
  Flex,
  Divider,
  Text,
  InputGroup,
  Input,
  InputRightElement,
  Stack,
  Box,
} from "@chakra-ui/react";

import "./App.css";
import { useNotification } from "./utils/feedback";
import WavePortalContract from "./utils/WavePortal.json";
import Header from "./components/Header";
import Bio from "./components/Bio";
import MetaMaskIcon from "./components/MetaMaskIcon";
import * as moment from "moment";

export default function App() {
  /**
   * Create a varaible here that holds the contract address after you deploy!
   */
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;
  const contractABI = WavePortalContract.abi;

  const [currentAccount, setCurrentAccount] = React.useState("");
  const [numberOfWaves, setNumberOfWaves] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [waveMessage, setWaveMessage] = React.useState("");
  const [allWaves, setAllWaves] = React.useState([]);

  const { notify } = useNotification();

  /*
   * Create a method that gets all waves from your contract
   */
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const waveportalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await waveportalContract.getAllWaves();

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
        setNumberOfWaves(wavesCleaned.length);
        /**
         * Listen in for emitter events!
         */
        waveportalContract.on("NewWave", (from, timestamp, message) => {
          console.log("NewWave", from, timestamp, message);

          setAllWaves((prevState) => [
            ...prevState,
            {
              address: from,
              timestamp: new Date(timestamp * 1000),
              message: message,
            },
          ]);
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        await getAllWaves();
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        notify({
          title: "Get MetaMask!",
          description:
            "You need a crypto wallet to interact with my smart contract.",
          status: "error",
        });
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const wave = async () => {
    let count;
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const waveportalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /*
         * Execute the actual wave from your smart contract
         */
        setIsLoading(true);
        const waveTxn = await waveportalContract.wave(waveMessage, {
          gasLimit: 300000,
        });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await waveportalContract.getTotalWaves();
        setNumberOfWaves(count.toNumber());
        setWaveMessage("");
        setIsLoading(false);
        console.log("Retrieved total wave count...", count.toNumber());
        notify({
          title: "Wave was successful!",
          description: "Thanks for waving at me!",
          status: "success",
        });
      } else {
        console.log("Ethereum object doesn't exist!");
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
      notify({
        title: "Could not complete wave!",
        description: error.message,
        status: "error",
      });
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <Container pb={20}>
      <Header />
      <Flex mt={5} direction="column">
        <Stack spacing={5}>
          <Heading>
            <span>👋🏾</span> Hey there!
          </Heading>
          <Bio />
        </Stack>

        <br />
        {currentAccount && (
          <InputGroup size="md">
            <Input
              pr="4.5rem"
              type="text"
              placeholder="Add emoji or wave message"
              border={"blue.500"}
              onInput={(event) => setWaveMessage(event.currentTarget.value)}
            />
            <InputRightElement width="4.5rem">
              <Button
                loadingText="Mining"
                colorScheme="blue"
                isLoading={isLoading}
                isDisabled={!waveMessage}
                h="1.75rem"
                size="sm"
                onClick={wave}
              >
                Wave
              </Button>
            </InputRightElement>
          </InputGroup>
        )}

        {/*
         * If there is no currentAccount render this button
         */}
        <br />
        {!currentAccount && (
          <Button
            leftIcon={<MetaMaskIcon />}
            colorScheme="blue"
            variant="outline"
            onClick={connectWallet}
          >
            Connect Wallet
          </Button>
        )}
        <Divider />
        <Text py={5} align="center" color="gray" fontSize="sm">
          I have <Text as="mark">{numberOfWaves}</Text> waves so far, you should
          say hi!
        </Text>
        {allWaves && allWaves?.length !== 0 && (
          <>
            <Divider />
            <Heading as="h4" size="md" mt={5}>
              Wave History
            </Heading>
            <Stack>
              {allWaves.map((waveDetails, index) => (
                <Box mt={5} key={index}>
                  <Text color="gray" fontSize="sm">
                    Address: {waveDetails.address}
                  </Text>
                  <Text color="gray" fontSize="sm">
                    Time: {moment(waveDetails.timestamp.toString()).fromNow()}
                  </Text>
                  <Text color="gray" fontSize="sm">
                    Message: {waveDetails.message}
                  </Text>
                  <Divider py={2} />
                </Box>
              ))}
            </Stack>
          </>
        )}
      </Flex>
    </Container>
  );
}
