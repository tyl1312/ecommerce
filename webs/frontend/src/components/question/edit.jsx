import React from 'react';
import { SimpleForm, TextInput, ArrayInput, SimpleFormIterator, required, Edit, ReferenceInput, SelectInput } from 'react-admin';

const QuestionEdit = () => {
    return (
        <div className="w-full min-h-[calc(100vh-72px)] py-14 px-10">
            <Edit>
                <SimpleForm>
                    <TextInput source="question" validate={[required()]} />
                    <TextInput source="correctOption" validate={required()} />
                    <ArrayInput source="incorrectOptions">
                        <SimpleFormIterator>
                            <TextInput />
                        </SimpleFormIterator>
                    </ArrayInput>
                    <ReferenceInput source="quiz" reference="quiz">
                        <SelectInput optionText="title" />
                    </ReferenceInput>
                </SimpleForm>
            </Edit>
        </div>
    )
};

export default QuestionEdit;
