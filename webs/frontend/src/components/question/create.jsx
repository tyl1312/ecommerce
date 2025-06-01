import React from 'react';
import { Create, SimpleForm, TextInput, required } from 'react-admin';

const QuestionCreate = () => {
    return (
        <div className="w-full min-h-[calc(100vh-72px)] py-14 px-10">
            <Create>
                <SimpleForm>
                    <TextInput source="question" validate={[required()]} />
                    <TextInput source="correctOption" validate={required()} />
                </SimpleForm>
            </Create>
        </div>
    );
};

export default QuestionCreate;
