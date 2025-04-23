'use server'

import nodemailer from 'nodemailer'
import { ISendEmail, IEmailValidation, IEmailValidationResponse } from '@/app/types/interfaces/email'
import { createClient } from '@/utils/supabase/server'
import { StatusCodes } from 'http-status-codes'

const SMTP_SERVICE = process.env.SMTP_SERVICE || `gmail`
const SMTP_SERVER_HOST = process.env.SMTP_SERVER_HOST || 'smtp.gmail.com'
const SMTP_SERVER_PORT = process.env.SMTP_SERVER_PORT || 587
const SMTP_TO_EMAIL = process.env.SMTP_TO_EMAIL
const SMTP_TO_PASSWORD = process.env.SMTP_TO_PASSWORD
const SMTP_SECURE = process.env.SMTP_SECURE || true

export const sendEmail = async (props: ISendEmail) => {
  const transporter = nodemailer.createTransport({
    service: SMTP_SERVICE,
    host: SMTP_SERVER_HOST,
    port: Number(SMTP_SERVER_PORT),
    secure: String(SMTP_SECURE) === 'true',
    auth: {
      user: SMTP_TO_EMAIL,
      pass: SMTP_TO_PASSWORD
    }
  })

  try {
    const isVerified = await transporter.verify()
    if (!isVerified) {
      throw new Error('SMTP server verification failed')
    }

    const info = await transporter.sendMail({
      from: `"SERP-UPDATE" <${SMTP_TO_EMAIL}>`,
      to: props.sendTo,
      subject: props.subject,
      html: props.htmlBody
    })

    console.log('Message sent:', info.messageId)
    return {
      success: true,
      data: info
    }
  } catch (error) {
    console.error('Error occurred while sending emailFormat:', error)
    return {
      success: false,
      error: {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Failed to send emailFormat'
      }
    }
  }
}

export const validateEmailOrId = async (identifier: string): Promise<IEmailValidationResponse> => {
  if (!identifier) {
    return {
      success: false,
      error: {
        statusCode: StatusCodes.BAD_REQUEST,
        message: 'Identifier (ID or Email) is required'
      }
    }
  }

  const supabase = await createClient()

  const isEmail = identifier.includes('@')

  const { data, error, status } = await supabase
    .from('profiles')
    .select('id, email')
    .or(isEmail ? `email.eq.${identifier}` : `id.eq.${identifier}`)
    .maybeSingle()

  if (error) {
    return {
      success: false,
      error: {
        statusCode: status || StatusCodes.BAD_REQUEST,
        message: error.message
      }
    }
  }

  if (!data) {
    return {
      success: false,
      error: {
        statusCode: StatusCodes.NOT_FOUND,
        message: 'User not found'
      }
    }
  }

  return {
    success: true,
    data: {
      id: data.id,
      email: data.email
    }
  }
}
