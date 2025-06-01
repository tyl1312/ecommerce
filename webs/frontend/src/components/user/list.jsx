import { useMediaQuery } from "@mui/material";
import React from "react";
import {
    List,
    Datagrid,
    TextField,
    NumberField,
    EmailField,
    DateField,
    EditButton,
    DeleteButton,
    SimpleList
} from 'react-admin';

const UserList = (props) => {
    const isSmall = useMediaQuery((theme) => theme.breakpoints.down("sm"));
    return (
        <div className="w-full min-h-[calc(100vh-72px)] py-5 px-10">
            <List {...props}>
                {isSmall ? (
                    <SimpleList
                        primaryText={(record) => record.username}
                        secondaryText={(record) => record.email}
                        tertiaryText={(record) => record.role}
                    />
                ) : (
                    <Datagrid rowClick="edit">
                        <TextField source="id" />
                        <TextField source="username" />
                        <EmailField source="email" />
                        <TextField source="isVerified" />
                        <TextField source="role" />
                        <NumberField source="experience" />
                        <DateField source="createdAt" />
                        <EditButton basepath="/users" />
                        <DeleteButton basepath="/users" />
                    </Datagrid>
                )}
            </List >
        </div>
    )
};

export default UserList;