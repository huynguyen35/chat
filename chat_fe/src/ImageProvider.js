export const imgProvider = async (imageData) => {
    const apiUrl = `https://api.imgbb.com/1/upload?key=0a380fc308aca047a31367fd4627ffc9`;

    const formData = new FormData();
    formData.append("image", imageData);

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                Accept: "application/json"
            },
            body: formData
        });

        const data = await response.json();
        if (data && data.data && data.data.url) {
            console.log("URL của ảnh đã upload:", data.data.url);
            return data.data.url;
        } else {
            console.log("Lỗi khi upload ảnh:", data.error.message);
            return data.error.message;
        }
    } catch (error) {
        console.log("Lỗi khi thực hiện yêu cầu upload:", error);
    }
};

export async function getBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
            resolve(reader.result.split(',')[1])
        }
        reader.onerror = reject
    })
}