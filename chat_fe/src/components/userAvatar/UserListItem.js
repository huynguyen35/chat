import { AvatarFallback, AvatarImage, AvatarRoot, Box, Text } from "@chakra-ui/react";

const UserListItem = ({ user, handleFunction }) => {
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#E8E8E8"
      _hover={{
        background: "#38B2AC",
        color: "white",
      }}
      w="100%"
      d="flex"
      alignItems="center"
      color="black"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
    >
      <AvatarRoot size="sm" marginRight={2} cursor="pointer">
        <AvatarFallback name={fullName || user?.email} />
        <AvatarImage src={user?.avt} />
      </AvatarRoot>
      <Box>
        <Text>{fullName || user?.email}</Text>
        <Text fontSize="xs">
          <b>Email : </b>
          {user?.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;
