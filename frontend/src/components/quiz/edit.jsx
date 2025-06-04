import { SimpleForm, Edit, required, ReferenceField,TextInput, ReferenceArrayInput, SelectArrayInput, ReferenceArrayField, Datagrid, TextField } from 'react-admin';

const QuizEdit = () => {
    return (
        <div className="w-full min-h-[calc(100vh-72px)] py-14 px-10">
            <Edit>
                <SimpleForm>
                    <TextInput source="title" validate={[required()]} />
                    <ReferenceArrayInput source="course" reference="course">
                        <SelectArrayInput optionText="courseTitle" />
                    </ReferenceArrayInput>
                    <TextInput source="description" validate={required()} />
                    <h3><strong>List of Questions</strong></h3>
                    <ReferenceArrayField source="question" reference="question" >
                        <Datagrid>
                            <ReferenceField source="id" reference="question" label="Questions">
                                <TextField source="question" />
                            </ReferenceField>
                            <TextField source="correctOption" />
                        </Datagrid>
                    </ReferenceArrayField>

                </SimpleForm>
            </Edit>
        </div>
    )
}

export default QuizEdit;