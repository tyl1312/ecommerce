import { SimpleForm, Edit, required, NumberInput, SelectInput } from 'react-admin';

const UserEdit = (props) => {
    return (
        <div className="w-full min-h-[calc(100vh-72px)] py-14 px-10">
            <Edit {...props}>
                <SimpleForm>
                    <NumberInput source="experience" />
                    <SelectInput
                        source="isVerified"
                        validate={required()}
                        choices={[
                            { id: 'false', name: 'false' },
                            { id: 'true', name: 'true' },
                        ]}
                    />
                </SimpleForm>
            </Edit>
        </div>
    )
}

export default UserEdit;