import { Input } from "@chakra-ui/react";
import { Field } from "@/components/ui/field";
import React, { useState, forwardRef } from "react";
import { Controller } from "react-hook-form";
import ErrorMessage from "./ErrorMessage";
import { addErrorIntoField } from "@/utils/utils";

interface TextFieldProps {
    label?: string;
    placeholder?: string;
    defaultValue?: string;
    name: string;
    control?: any;
    errors?: any;
    onEdit?: (isEditing: boolean) => void;
    marginTop?: number;
    isDisabled?: boolean;
    handleKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({
    label,
    placeholder,
    name,
    control,
    errors,
    defaultValue,
    onEdit,
    marginTop = 5,
    isDisabled = false,
    handleKeyDown
}, ref) => {
    const [isEditing, setIsEditing] = useState(false);

    const hasError = (errors: any) => errors?.message;

    const handleEdit = (editing: boolean) => {
        setIsEditing(editing);
        onEdit && onEdit(editing);
    };

    return (
        <>
            <Controller
                name={name}
                control={control}
                defaultValue={defaultValue}
                rules={{ required: "This field is required" }}
                render={({ field }) => {
                    const inputProps = {
                        placeholder,
                        fontSize: "sm",
                        fontWeight: "400",
                        px: 3,
                        value: field.value !== undefined && field.value !== null ? field.value : defaultValue || "",
                        color: hasError(errors) && !isEditing ? "red.500" : "gray.700",
                        borderColor: hasError(errors) && !isEditing ? "red.500" : "gray.200",
                        borderWidth: "1px",
                        _placeholder: { opacity: 1, color: "gray.400" },
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                            const newValue = e.target.value;
                            field.onChange(newValue);
                            handleEdit(true);
                        },
                        onBlur: () => handleEdit(false),
                        disabled: isDisabled,
                        background: isDisabled ? "gray.100" : "white",
                        onKeyDown: handleKeyDown,
                        ref
                    };

                    return label ? (
                        <Field
                            label={label}
                            {...field}
                            fontSize="md"
                            marginTop={marginTop}
                            fontWeight="500"
                            color="gray.700"
                            {...(errors && errors.message ? addErrorIntoField(errors) : undefined)}
                        >
                            <Input {...inputProps} />
                        </Field>
                    ) : (
                        <Input {...inputProps} />
                    );
                }}
            />
            {hasError(errors) && <ErrorMessage message={errors.message} />}
        </>
    );
});

TextField.displayName = "TextField";

export default TextField;
