import { Datagrid, List, EditButton, TextField, DeleteButton, SimpleList } from 'react-admin';
import { useMediaQuery } from "@mui/material";


const QuizList = () => {
  const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  return (
    <div className="w-full min-h-[calc(100vh-72px)] py-5 px-10">
      <List>
        {isSmall ? (
          <SimpleList
            primaryText={(record) => record.title}
            secondaryText={(record) => record.description}
          />
        ) : (
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="title" />
            <TextField source="description" />
            <EditButton basepath="/quizzes" />
            <DeleteButton basepath="/quizzes" />
          </Datagrid>
        )}
      </List>
    </div>
  );
};

export default QuizList;