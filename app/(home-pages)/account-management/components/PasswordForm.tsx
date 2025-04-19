import React, { useCallback, useEffect, useState } from 'react';
import { Box, HStack, Text, Button, Separator } from '@chakra-ui/react';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { PasswordFormValues } from '@/app/types/accountManagement';
import { passwordSchema } from '../schemas';
import TextFieldPassword from '@/components/TextFieldPassword';

type PasswordFormProps = {
    userPassword: PasswordFormValues;
    handleSave: (box: 'profile' | 'affiliate' | 'password', data: any) => Promise<string | null>;
    setIsEdited: (value: React.SetStateAction<{ profile: boolean; affiliate: boolean; password: boolean }>) => void;
    isEdited: { password: boolean };
    handleCancel: (box: 'profile' | 'affiliate' | 'password') => void;
}

function PasswordForm({ userPassword, handleSave, setIsEdited, isEdited, handleCancel }: PasswordFormProps) {
    const passwordForm = useForm<PasswordFormValues>({
        defaultValues: userPassword,
        resolver: yupResolver(passwordSchema),
        mode: 'onSubmit',
        reValidateMode: 'onSubmit'
    });

    const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

    const passwordValue = useWatch({
        control: passwordForm.control,
        name: 'password',
    });

    useEffect(() => {
        const minLengthMet = passwordValue?.length >= 8;
        setIsCheckboxChecked(minLengthMet);
    }, [passwordValue]);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsCheckboxChecked(e.target.checked);
    };

    const onSubmit = useCallback(async (data: PasswordFormValues) => {
        const errorMessage = await handleSave('password', data);
        if (errorMessage) {
            passwordForm.setError('currentPassword', { type: 'manual', message: errorMessage });
        }
    }, [handleSave, passwordForm]);

    const handleEdit = useCallback(
        (edited: boolean) => {
            setIsEdited((prev) => ({
                ...prev,
                password: edited
            }));
        },
        [setIsEdited]
    );

    return (
        <Box width="100%" background={'white'} padding={2}>
            <form onSubmit={passwordForm.handleSubmit(onSubmit)}>
                <Text background={'primary.50'} fontSize={'sm'} color={'gray.900'} fontWeight={'600'} padding={'8px 16px'}>
                    Change Password
                </Text>
                <HStack width="100%" paddingX={'16px'} spaceX={3} alignItems="start">
                    <Box flex={1}>
                        <TextFieldPassword
                            label="Current Password"
                            placeholder="Minimum 8 characters"
                            control={passwordForm.control}
                            name="currentPassword"
                            defaultValue={userPassword.currentPassword}
                            errors={passwordForm.formState.errors.currentPassword}
                            onEdit={handleEdit}
                        />
                    </Box>
                    <Box flex={1}>
                        <TextFieldPassword
                            label="Password"
                            placeholder="Minimum 8 characters"
                            control={passwordForm.control}
                            name="password"
                            defaultValue={userPassword.password}
                            errors={passwordForm.formState.errors.password}
                            onEdit={handleEdit}
                        />
                    </Box>
                    <Box flex="1">
                        <TextFieldPassword
                            label="Confirm New Password"
                            placeholder="Minimum 8 characters"
                            control={passwordForm.control}
                            name="confirmPassword"
                            defaultValue={userPassword.confirmPassword}
                            errors={passwordForm.formState.errors.confirmPassword}
                            onEdit={handleEdit}
                        />
                    </Box>
                </HStack>
                <Box paddingX={5} marginY={5}>
                    <Separator />
                </Box>
                <Box width="100%" paddingX={'16px'} marginTop={5}>
                    <Text fontSize={'sm'} fontWeight={'500'} color={'gray.700'}>
                        Password Instructions
                    </Text>
                    <Checkbox marginTop={3} checked={isCheckboxChecked} readOnly>
                        <Text fontSize={'sm'} color={'gray.700'} fontWeight={'400'}>
                            At least 8 characters
                        </Text>
                    </Checkbox>
                </Box>
                <Box display="flex" justifyContent="flex-end" margin={'20px 16px 12px'}>
                    {(isEdited.password || passwordForm.formState.isDirty) && (
                        <Button
                            size={'md'}
                            background={'white'}
                            marginRight={3}
                            color={'gray.800'}
                            onClick={() => {
                                handleCancel('password');
                                passwordForm.reset(userPassword);
                            }}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="submit"
                        size={'md'}
                        background={'primary.500'}
                        disabled={!isEdited.password && !passwordForm.formState.isDirty}
                    >
                        Save
                    </Button>
                </Box>
            </form>
        </Box>
    );
}

export default React.memo(PasswordForm);