import {
    Create,
    SimpleForm,
    TextInput,
    required,
    ReferenceArrayInput,
} from "react-admin";

const QuizCreate = () => {
    return (
        <div className="w-full min-h-[calc(100vh-72px)] py-14 px-10">
            <Create>
                <SimpleForm>
                    <TextInput source="title" validate={[required()]} label="Title" />
                    <TextInput source="description" validate={required()} label="Description" />
                </SimpleForm>
            </Create>
        </div>
    );
};

export default QuizCreate;