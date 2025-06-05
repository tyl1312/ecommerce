import { SimpleForm, Create, required, TextInput, ImageInput, ImageField } from 'react-admin';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const validateFile = (file) => {
    if (!file) {
        return 'Required';
    }
    console.log(file);
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const fileExtension = file.rawFile.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
        return 'Invalid file type. Only JPG, JPEG, and PNG are allowed.';
    }

    return undefined; 
};

const CourseCreate = () => {
    const navigate = useNavigate();

    const handleSubmit = async (values) => {
        try {
            const formData = new FormData();
            formData.append('courseTitle', values.courseTitle);
            formData.append('description', values.description);
            formData.append('image', values.image.rawFile);

            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/courses/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                },
                withCredentials: true
            });
            
            navigate('/adminPanel/course');
        } catch (error) {
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
