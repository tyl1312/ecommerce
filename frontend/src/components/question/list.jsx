import { Datagrid, EditButton, List, TextField, DeleteButton, ReferenceField, ChipField, SimpleList, ArrayField } from "react-admin"
import { useMediaQuery } from "@mui/material";


const QuestionList = () => {
    const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"));
    return (
        <div className="w-full min-h-[calc(100vh-72px)] py-5 px-10">
            <List>
                {isSmall ? (
                    <SimpleList
                        primaryText={(record) => record.question}
                        tertiaryText={(record) => record.correctOption}
                    />
                ) : (
                    <Datagrid rowClick="edit">
                        <TextField source="id" />
                        <TextField source="question" />
                        <ReferenceField source="quiz" reference="quiz">
                            <ChipField source="title" />
                        </ReferenceField>
                        <TextField source="correctOption" />
                        <EditButton basepath="/questions" />
                        <DeleteButton basepath="/questions" />

                    </Datagrid>
                )}
            </List>
        </div>
    )
};

export default QuestionList;