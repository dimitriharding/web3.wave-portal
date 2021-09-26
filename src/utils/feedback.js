import { useToast } from "@chakra-ui/react";

export const useNotification = () => {
  const toast = useToast();
  const notify = ({ title, description, status }) =>
    toast({
      title,
      description,
      status,
      duration: 9000,
      isClosable: true,
    });

  return {
    notify,
  };
};
