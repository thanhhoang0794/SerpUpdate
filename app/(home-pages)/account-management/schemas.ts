import * as yup from 'yup'
import { emailRegularExpression, usernameRegularExpression, passwordRegularExpression } from '@/utils/utils'

export const profileSchema = yup.object().shape({
    // TODO: Add username validation for next sprint
    // username: yup
    //     .string()
    //     .required('Username is empty')
    //     .matches(usernameRegularExpression, 'Username cannot contain special characters'),
    // email: yup
    //     .string()
    //     .required('Email is empty')
    //     .matches(emailRegularExpression, 'Please enter a valid email address'),
    // avatar: yup.string().optional(),
    // registrationDate: yup.string().optional()
})

export const passwordSchema = yup.object().shape({
    currentPassword: yup.string().required('Current Password is empty'),
    password: yup
        .string()
        .required('Password is empty')
        .matches(
            passwordRegularExpression,
            "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
        )
        .notOneOf([yup.ref('currentPassword')], 'Password must be different from current password'),
    confirmPassword: yup
        .string()
        .required('Confirm Password is empty')
        .oneOf([yup.ref('password')], 'Passwords must match')
}) 