import { Checkbox } from "@/components/ui/checkbox";
import { HStack, Text } from "@chakra-ui/react";
import { Controller } from "react-hook-form";
import { addErrorIntoField } from "@/utils/utils";
import React from 'react';
import ErrorMessage from "./ErrorMessage";

interface CheckboxFieldProps {
    name: string;
    control: any;
    errors: any;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ name, control, errors }) => {
    return (
        <>
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Checkbox 
                        variant="solid" 
                        {...field} 
                        {...(errors && errors.message ? addErrorIntoField(errors) : {})} 
                        colorPalette="blue" 
                        paddingTop={10}
                    >
                        <HStack fontSize="small" fontWeight="600">
                            I confirm that I have read and agree to <Text color="blue.500">Terms & Conditions</Text>
                        </HStack>
                    </Checkbox>
                )}
            />
            {errors && errors.message && <ErrorMessage message={errors.message} />}
        </>
    );
}

export default CheckboxField;
