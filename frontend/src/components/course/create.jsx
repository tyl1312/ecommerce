import { SimpleForm, Create, required, TextInput, ImageInput, ImageField } from 'react-admin';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const validateFile = (file) => {
    if (!file) {
        return 'Required';
    }
    console.log(file);
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const fileExtension = file.rawFile.name.split('.').pop().toLowerCase(); // Sửa thành 'file.rawFile.name' thay vì 'file.title'
    if (!allowedExtensions.includes(fileExtension)) {
        return 'Invalid file type. Only JPG, JPEG, and PNG are allowed.';
    }

    return undefined; // No error
};

const CourseCreate = () => {
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        try {
            const formData = new FormData();
            formData.append('courseTitle', values.courseTitle);
            formData.append('description', values.description);
            formData.append('image', values.image.rawFile); // Truy cập rawFile để lấy đối tượng File

            const response = await axios.post(import.meta.env.VITE_APP_API_URL + '/course/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'X-CSRF-Token': localStorage.getItem('csrfToken')
                },
                withCredentials: true
            });
            localStorage.setItem('csrfToken', response.headers['x-csrf-token']);
            navigate('/adminPanel/course');
        } catch (error) {
            const csrfToken = error.response.headers['x-csrf-token'];
            localStorage.setItem('csrfToken', csrfToken);
            console.error('Error creating course:', error);
        }
    };

    return (
        <div className="w-full min-h-[calc(100vh-72px)] py-14 px-10">
            <Create>
                <SimpleForm onSubmit={handleSubmit}>
                    <TextInput source="courseTitle" validate={required()} />
                    <TextInput source="description" validate={required()} />
                    <ImageInput
                        source="image"
                        label="Upload Image"
                        accept="image/*"
                        validate={validateFile}
                    >
                        <ImageField source="src" title="title" />
                    </ImageInput>
                </SimpleForm>
            </Create>
        </div>
    );
};

export default CourseCreate;
