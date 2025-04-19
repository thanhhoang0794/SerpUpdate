import { Box, HStack, Text, Input } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { ProfileFormValues } from '@/app/types/accountManagement'
import { profileSchema } from '../schemas'
import FileUploadField from '@/components/FileUploadField '
import TextField from '@/components/TextField'
import { Field } from '@/components/ui/field'

type ProfileFormProps = {
    userProfile: ProfileFormValues;
    isGoogleLogin: boolean;
    uid: string;
    handleSave: (box: 'profile' | 'affiliate' | 'password', data: any) => void;
    setIsEdited: (prev: any) => void;
}

export default function ProfileForm({ userProfile, isGoogleLogin, uid, handleSave, setIsEdited }: ProfileFormProps) {
    const profileForm = useForm<ProfileFormValues>({
        defaultValues: userProfile,
        resolver: yupResolver(profileSchema),
        mode: 'onSubmit',
        reValidateMode: 'onSubmit'
    })
    return (
        <Box width="100%" background={'white'} padding={2}>
            <form onSubmit={profileForm.handleSubmit(data => handleSave('profile', data))}>
                <Text background={'primary.50'} fontSize={'sm'} color={'gray.900'} fontWeight={'600'} padding={'8px 16px'}>
                    Profile Detail
                </Text>
                <Box width="100%" padding={'20px 16px 0px'}>
                    <FileUploadField
                        uid={uid}
                        url={userProfile.avatar ?? ''}
                        size={150}
                        onUpload={(url) => {
                            handleSave('profile', { ...userProfile, avatar: url })
                        }}
                        isDisabled={isGoogleLogin}
                    />
                </Box>
                <HStack width="100%" paddingX={'16px'} spaceX={3} alignItems="start">
                    <Box width="433px">
                        <TextField
                            label="Username"
                            defaultValue={userProfile.username}
                            placeholder="Enter your username"
                            control={profileForm.control}
                            name="username"
                            errors={profileForm.formState.errors.username || undefined}
                            onEdit={edited => setIsEdited((prev: { profile: boolean }) => ({ ...prev, profile: edited }))}
                            isDisabled={true}
                        />
                    </Box>
                    <Box flex="1">
                        <TextField
                            label="Email"
                            defaultValue={userProfile.email}
                            placeholder="Enter your email"
                            control={profileForm.control}
                            name="email"
                            errors={profileForm.formState.errors.email || undefined}
                            onEdit={edited => setIsEdited((prev: { profile: boolean }) => ({ ...prev, profile: edited }))}
                            isDisabled={true}
                        />
                    </Box>
                </HStack>
                <Box paddingLeft={5} marginTop={5}>
                    <Text color="gray.700" fontSize={"sm"} fontWeight="500">Registration Date</Text>
                    <Input placeholder={userProfile.registrationDate} disabled background={'gray.100'} width="433px" />
                </Box>
                <Box margin={'20px 16px 12px'}></Box>
            </form>
        </Box>
    )
}