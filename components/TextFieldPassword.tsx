import { PasswordInput } from "@/components/ui/password-input";
import { Field } from "@/components/ui/field";
import React, { useState } from 'react';
import { Control, Controller, FieldError } from "react-hook-form";
import ErrorMessage from "./ErrorMessage";
import { addErrorIntoField } from "@/utils/utils";

type TextFieldPasswordProps = {
    label: string;
    placeholder: string;
    control: Control<any>;
    name: string;
    defaultValue?: string;
    errors?: FieldError;
    onEdit?: (edited: boolean) => void;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const TextFieldPassword: React.FC<TextFieldPasswordProps> = ({ label, placeholder, name, control, errors, onEdit, defaultValue, onChange }) => {
    const [isEditing, setIsEditing] = useState(false);
    // const [localValue, setLocalValue] = useState(defaultValue || "");

    const handleEdit = (editing: boolean) => {
        setIsEditing(editing);
        onEdit && onEdit(editing);
    };

    return (
        <>
            <Controller
                name={name}
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                    <Field
                        label={label}
                        {...field}
                        fontSize="sm"
                        marginTop={5}
                        fontWeight="400"
                        color="gray.700"
                        borderColor="gray.200"
                        {...(errors ? addErrorIntoField(true) : undefined)}
                    >
                        <PasswordInput
                            placeholder={placeholder}
                            fontSize="sm"
                            fontWeight="400"
                            px={3}
                            value={field.value !== undefined ? field.value : defaultValue}
                            color={errors && !isEditing ? "red.500" : "gray.700"}
                            borderColor={errors && !isEditing ? "red.500" : "gray.200"}
                            borderWidth="1px"
                            _placeholder={{ opacity: 1, color: 'gray.400' }}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                field.onChange(newValue);
                                handleEdit(true);
                                // if (errors) setIsEditing(true);
                            }}
                            onBlur={() => {
                                handleEdit(true);
                            }}
                        />
                    </Field>
                )}
            />
            {errors && <ErrorMessage message={errors.message || ''} />}
        </>
    );
}

export default TextFieldPassword;
