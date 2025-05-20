import {
    Button,
    useDisclosure,
    IconButton,
    Text,
    Portal,
    Dialog,
    AvatarRoot,
    AvatarFallback,
    AvatarImage,
    Image,
    useFileUploadContext,
    FileUploadItemGroup,
    FileUploadItem,
    FileUploadItemPreviewImage,
    Float,
    FileUploadItemDeleteTrigger,
    FileUploadRoot,
    FileUploadHiddenInput, FileUploadTrigger, Stack
} from "@chakra-ui/react";
import {LuFileImage, LuX, LuSave} from "react-icons/lu";
import {imgProvider} from "../ImageProvider";
import {updateAvt} from "../callAPI/API";

const ProfileModal = ({ user, isOpen, onClose, from}) => {
    return (
        <>
            <Dialog.Root size="lg" open={isOpen} onOpenChange={onClose} placement="center">
                <Portal>
                <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content>
                            <Dialog.Header
                            fontSize="40px"
                            fontFamily="Work sans"
                            display="flex"
                            justifyContent="center"
                            >
                                <Dialog.Title>{user.firstName} {user.lastName}</Dialog.Title>
                            </Dialog.Header>
                            <Dialog.CloseTrigger/>
                            <Dialog.Body
                                display="flex"
                                flexDir="column"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Stack>
                                    <Image
                                        borderRadius="full"
                                        boxSize="150px"
                                        src={user.avt? user.avt : "https://avatar.iran.liara.run/public/16"}
                                        alt={user.firstName}
                                        fit="cover"
                                    />
                                    {
                                        from === "profile" ? (
                                            <FileUploadRoot accept="image/*">
                                                <FileUploadHiddenInput />
                                                <FileUploadTrigger asChild margin={"auto"}>
                                                    <Button variant="outline" size="sm">
                                                        <LuFileImage /> Tải ảnh mới
                                                    </Button>
                                                </FileUploadTrigger>
                                                <FileUploadList />
                                            </FileUploadRoot>
                                        ): (
                                            <></>
                                        )
                                    }
                                </Stack>
                                <Text
                                    fontSize={{ base: "28px", md: "30px" }}
                                    fontFamily="Work sans"
                                    marginTop="10px"
                                >
                                    Email: {user.email}
                                </Text>
                            </Dialog.Body>
                            <Dialog.Footer>
                                <Button onClick={onClose}>Close</Button>
                            </Dialog.Footer>

                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
};

export default ProfileModal;

const FileUploadList = () => {
    const fileUpload = useFileUploadContext()
    const files = fileUpload.acceptedFiles
    if (files.length === 0) return null
    const user = JSON.parse(localStorage.getItem("userInfo"));

    const handleUpload = async () => {
    imgProvider(files[0])
        .then((url) => {
            console.log("URL của ảnh đã upload:", url);
            // do something with the url
            updateAvt(user.id, user.token, url)
                .then((res) => {
                    console.log("Cập nhật ảnh thành công:", res);
                })
                .catch((error) => {
                    console.log("Lỗi khi cập nhật ảnh:", error);
                });
        })
        .catch((error) => {
            console.log("Lỗi khi upload ảnh:", error);
        });
};
    return (
        <FileUploadItemGroup>
            {files.map((file) => (
                <FileUploadItem
                    w="100%"
                    boxSize="150px"
                    p="2"
                    file={file}
                    key={file.name}
                    align="center"
                >
                    <FileUploadItemPreviewImage height="100%" width="100%" objectFit="cover" />
                    <Float placement="top-end">
                        <FileUploadItemDeleteTrigger boxSize="4" layerStyle="fill.solid">
                            <LuX />
                        </FileUploadItemDeleteTrigger>
                    </Float>

                </FileUploadItem>
            ))}
            {
                files.length > 0 && (
                    <IconButton
                        size="sm"
                        variant="ghost"
                        color={"blue.500"}
                        onClick={() => {
                        console.log("Files to upload:", files);
                        handleUpload();
                    }}>
                        <LuSave />
                    </IconButton>
                )
            }
        </FileUploadItemGroup>
    )
}