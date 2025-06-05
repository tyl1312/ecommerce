import { useMediaQuery } from "@mui/material";
import React from "react";
import {
    List,
    Datagrid,
    TextField,
    EditButton,
    DeleteButton,
    FunctionField,
    SimpleList
} from 'react-admin';

const formatEstimatedTime = (record) => {
    const estimatedHours = record.estimatedTime;
    return `${estimatedHours} hours`;
};

const CourseList = () => {
    const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"));

    return (
        <div className="w-full min-h-[calc(100vh-72px)] py-5 px-10">
            <List>
                {isSmall ? (
                    <SimpleList
                        primaryText={(record) => record.courseTitle}
                        secondaryText={(record) => record.description}
                        tertiaryText={(record) => record.level}
                    />
                ) : (
                    <Datagrid rowClick="edit">
                        <TextField source="id" />
                        <TextField source="courseTitle" />
                        <TextField source="description" />
                        <TextField source="level" />
                        <FunctionField
                            label="Estimated Time"
                            render={formatEstimatedTime}
                            sortBy="estimatedTime"
                        />
                        <EditButton />
                        <DeleteButton />
                    </Datagrid>
                )}

            </List>
        </div>
    )
};

export default CourseList;