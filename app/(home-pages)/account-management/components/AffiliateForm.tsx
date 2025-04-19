import { Box, HStack, Text, Button } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { AffiliateFormValues } from '@/app/types/accountManagement'
import TextField from '@/components/TextField'
import { FaSave } from 'react-icons/fa'
import { ClipboardRoot, ClipboardLabel, ClipboardInput } from '@/components/ui/clipboard'
import { useEffect } from 'react'

type AffiliateFormProps = {
    userAffiliate: AffiliateFormValues;
    handleSave: (box: 'profile' | 'affiliate' | 'password', data: any) => void;
    setIsEdited: (prev: any) => void;
    isEdited: { affiliate: boolean };
    handleCancel: (box: 'profile' | 'affiliate' | 'password') => void;
}

export default function AffiliateForm({ userAffiliate, handleSave, setIsEdited, isEdited, handleCancel }: AffiliateFormProps) {
    const affiliateForm = useForm<AffiliateFormValues>({
        defaultValues: userAffiliate,
        mode: 'onSubmit',
        reValidateMode: 'onSubmit'
    })

    useEffect(() => {
        affiliateForm.reset(userAffiliate)
    }, [userAffiliate])

    return (
        <Box width="100%" background={'white'} padding={2}>
            <form onSubmit={affiliateForm.handleSubmit(data => handleSave('affiliate', data))}>
                <Text background={'primary.50'} fontSize={'sm'} color={'gray.900'} fontWeight={'600'} padding={'8px 16px'}>
                    Affiliate Information
                </Text>
                <HStack width="100%" paddingX={'16px'} spaceX={5} marginTop={5}>
                    <ClipboardRoot width={'436px'} value={userAffiliate.affiliatePasscode}>
                        <ClipboardLabel>Personal Affiliate Passcode</ClipboardLabel>
                        <ClipboardInput disabled background={'gray.100'} />
                    </ClipboardRoot>
                    <Box flex="1">
                        <TextField
                            marginTop={0}
                            label="Bank Account"
                            defaultValue={userAffiliate.accountBank}
                            placeholder="Account Number"
                            control={affiliateForm.control}
                            name="accountBank"
                            onEdit={edited => setIsEdited((prev: { affiliate: boolean }) => ({ ...prev, affiliate: edited }))}
                        />
                    </Box>
                </HStack>
                <Box width="100%" paddingX={'16px'} marginTop={5}>
                    <Text fontSize={'sm'} fontWeight={'500'} color={'gray.700'}>
                        Bank Name
                    </Text>
                    <HStack spaceX={3} marginTop={2}>
                        <Box flex="1">
                            <TextField
                                marginTop={0}
                                defaultValue={userAffiliate.bank}
                                placeholder="Bank"
                                control={affiliateForm.control}
                                name="bank"
                                onEdit={edited => setIsEdited((prev: { affiliate: boolean }) => ({ ...prev, affiliate: edited }))}
                            />
                        </Box>
                        <Box flex="1">
                            <TextField
                                marginTop={0}
                                defaultValue={userAffiliate.city}
                                placeholder="City"
                                control={affiliateForm.control}
                                name="city"
                                onEdit={edited => setIsEdited((prev: { affiliate: boolean }) => ({ ...prev, affiliate: edited }))}
                            />
                        </Box>
                        <Box flex="1">
                            <TextField
                                marginTop={0}
                                defaultValue={userAffiliate.branch}
                                placeholder="Branch"
                                control={affiliateForm.control}
                                name="branch"
                                onEdit={edited => setIsEdited((prev: { affiliate: boolean }) => ({ ...prev, affiliate: edited }))}
                            />
                        </Box>
                        <Box flex="1">
                            <TextField
                                marginTop={0}
                                defaultValue={userAffiliate.bankName}
                                placeholder="Bank name"
                                control={affiliateForm.control}
                                name="bankName"
                                onEdit={edited => setIsEdited((prev: { affiliate: boolean }) => ({ ...prev, affiliate: edited }))}
                            />
                        </Box>
                    </HStack>
                    <Box display="flex" justifyContent="flex-end" margin={'20px 0 12px'}>
                        {(isEdited.affiliate || affiliateForm.formState.isDirty) && (
                            <Button
                                size={'md'}
                                background={'white'}
                                marginRight={3}
                                color={'gray.800'}
                                onClick={() => {
                                    handleCancel('affiliate');
                                    affiliateForm.reset(userAffiliate);
                                }}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            size={'md'}
                            background={'primary.500'}
                            disabled={!isEdited.affiliate && !affiliateForm.formState.isDirty}
                        >
                            Save <FaSave />
                        </Button>
                    </Box>
                </Box>
            </form>
        </Box>
    )
}