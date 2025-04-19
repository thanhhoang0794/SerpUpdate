'use client'
import { Button, Box, VStack, Image } from "@chakra-ui/react";
import { useForm, SubmitHandler } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from 'yup';
import TextFieldPassword from "@/components/TextFieldPassword";
import { useState } from "react";
import { passwordRegularExpression } from "@/utils/utils";
import { resetPasswordAction } from "@/app/actions";

interface IFormInputs {
  password: string
  confirmPassword: string
}

// create schema validation
const schema = yup.object({
  password: yup
    .string()
    .required('Password is Required')
    .matches(
      passwordRegularExpression,
      'Please enter a valid passwor: Minimum 8 characters, at least one letter, one number and one special character'
    ),
  confirmPassword: yup.string().oneOf([yup.ref('password'), undefined], 'Both password didn’t match').required('Confirm password is Required'),
});

function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);

  const { handleSubmit, control, reset, formState: { errors } } = useForm<IFormInputs>({
    resolver: yupResolver(schema),
    reValidateMode: 'onSubmit',
  })

  const onSubmit: SubmitHandler<IFormInputs> = async (data) => {
    setLoading(true);
    // reset();
    await resetPasswordAction(data)
    setLoading(false);
  };

  return (
    <VStack background="bg" shadow="md" borderRadius="2xl" padding={10} width="500px" minHeight={96}>
      <Box>
        <Image src="/image.svg" alt="Logo" width="250px" height="45px" />
      </Box>
      <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
        <VStack gapY={0} alignItems={"start"}>
          <TextFieldPassword label="Password" placeholder="Minimum 8 characters" control={control}
            name='password' errors={errors.password} />
          <TextFieldPassword label="Confirm password" placeholder="Confirm password" control={control} name='confirmPassword' errors={errors.confirmPassword} />
          <Button type="submit" marginTop={10} width={"full"} colorPalette="blue" height={12} fontSize="lg" fontWeight="600" disabled={loading}>
            {loading ? "Resetting Password..." : " Reset Password"}
          </Button>
        </VStack>
      </form>
    </VStack>
  );
}

export default ResetPasswordPage;
